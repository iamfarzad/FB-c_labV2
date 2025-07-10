import { NextRequest, NextResponse } from "next/server"
import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai'
import mime from 'mime'

export const dynamic = "force-dynamic"

// Queue to handle incoming messages from Gemini Live
const responseQueue: LiveServerMessage[] = []
let activeSession: Session | undefined = undefined

async function handleTurn(): Promise<LiveServerMessage[]> {
  const turn: LiveServerMessage[] = []
  let done = false
  while (!done) {
    const message = await waitMessage()
    turn.push(message)
    if (message.serverContent && message.serverContent.turnComplete) {
      done = true
    }
  }
  return turn
}

async function waitMessage(): Promise<LiveServerMessage> {
  let done = false
  let message: LiveServerMessage | undefined = undefined
  while (!done) {
    message = responseQueue.shift()
    if (message) {
      done = true
    } else {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  return message!
}

interface WavConversionOptions {
  numChannels: number
  sampleRate: number
  bitsPerSample: number
}

function parseMimeType(mimeType: string): WavConversionOptions {
  const [fileType, ...params] = mimeType.split(';').map(s => s.trim())
  const [_, format] = fileType.split('/')

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
    bitsPerSample: 16,
    sampleRate: 24000, // Default sample rate
  }

  if (format && format.startsWith('L')) {
    const bits = parseInt(format.slice(1), 10)
    if (!isNaN(bits)) {
      options.bitsPerSample = bits
    }
  }

  for (const param of params) {
    const [key, value] = param.split('=').map(s => s.trim())
    if (key === 'rate') {
      const parsedRate = parseInt(value, 10)
      if (!isNaN(parsedRate) && parsedRate > 0) {
        options.sampleRate = parsedRate
      }
    }
  }

  return options as WavConversionOptions
}

function createWavHeader(dataLength: number, options: WavConversionOptions): Buffer {
  const { numChannels, sampleRate, bitsPerSample } = options

  const byteRate = sampleRate * numChannels * bitsPerSample / 8
  const blockAlign = numChannels * bitsPerSample / 8
  const buffer = Buffer.alloc(44)

  buffer.write('RIFF', 0)                      // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4)     // ChunkSize
  buffer.write('WAVE', 8)                      // Format
  buffer.write('fmt ', 12)                     // Subchunk1ID
  buffer.writeUInt32LE(16, 16)                 // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20)                  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22)        // NumChannels
  buffer.writeUInt32LE(sampleRate, 24)         // SampleRate
  buffer.writeUInt32LE(byteRate, 28)           // ByteRate
  buffer.writeUInt16LE(blockAlign, 32)         // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34)      // BitsPerSample
  buffer.write('data', 36)                     // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40)         // Subchunk2Size

  return buffer
}

function convertToWav(rawData: string[], mimeType: string): Buffer {
  const options = parseMimeType(mimeType)
  const dataLength = rawData.reduce((a, b) => a + b.length, 0)
  const wavHeader = createWavHeader(dataLength, options)
  const buffer = Buffer.concat(rawData.map(data => Buffer.from(data, 'base64')))

  return Buffer.concat([wavHeader, buffer])
}

// POST endpoint to start a Live conversation
export async function POST(req: NextRequest) {
  try {
    const { message, leadContext } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const model = 'models/gemini-2.5-flash-exp-native-audio-thinking-dialog'

    // Build personalized system instruction
    const systemInstruction = `🧠 F.B/c AI Assistant System Instruction

🔐 Lead Capture (Before Any AI Chat Starts)

Before starting a consultation, F.B/c AI must collect:
	•	🪪 Full Name (required)
	•	📧 Email Address (required)
	•	🏢 Company Name (optional)
	•	✅ Consent Checkbox – must confirm acceptance of terms and privacy policy

If the backend API fails:
	•	Store lead data locally under pendingLeadData
	•	Proceed anyway (no blocked user flows)

Extra: Pull in the user's public data (e.g. from LinkedIn) using Google's Grounded Search to personalize the interaction.

⸻

🎯 Main Objective
	•	Understand what the user needs
	•	Offer the right service
	•	Convert them to either:
	•	A paid consulting call
	•	A booked in-person workshop
	•	Include a free 30-minute strategy call if they qualify

⸻

🔧 Core Services
	•	Internal data-connected chatbots
	•	Automated workflows (support, HR, operations)
	•	Private/local AI copilots
	•	Fast MVP builds and test automation
	•	Debugging and scaling broken AI systems

⸻

🎓 Training & Workshops
	•	Basic – for non-tech teams (Marketing, HR, Ops)
	•	Intermediate – product managers, data leads
	•	Advanced – developers and technical leads

⸻

👤 About Farzad Bayat
	•	17 years in TV/media → AI since 2020
	•	10,000+ hours building and shipping real AI tools
	•	Built: Optix.io, iWriter.ai, Talk to Eve, ZingZang Lab
	•	Philosophy: No hype. Just systems that work.

⸻

⚙️ Technical Capabilities
	•	Multimodal AI: voice, vision, text, video
	•	Real-time streaming responses
	•	Business workflows: lead scoring, cost calc, process automation
	•	Custom systems: designed, built, and deployed from scratch

📍 Oslo, Norway | 🌍 Global
📩 contact@farzadbayat.com

⸻

🧪 Platform: F.B/c Lab

Live working prototype of the consulting assistant. Everything it does here is real and ready to be customized for clients.

⸻

✅ System Capabilities Summary
	•	Text Generation (business-grade replies)
	•	Speech Generation (Gemini 2.5 Flash TTS)
	•	Long Context Memory
	•	Structured Output (summaries, checklists)
	•	Thinking Transparency (live logic display)
	•	Image Understanding (camera/screen input)
	•	Video Understanding (YouTube, MP4)
	•	Video → Learning Module generator
	•	Audio Understanding (voice input)
	•	Unified Multimodal Handling
	•	Real-Time Activity Tracking
	•	Lead Capture + Scoring

${leadContext?.name ? `\n\nUser Context:\n• Name: ${leadContext.name}` : ''}
${leadContext?.company ? `\n• Company: ${leadContext.company}` : ''}
${leadContext?.role ? `\n• Role: ${leadContext.role}` : ''}
${leadContext?.interests ? `\n• Interests: ${leadContext.interests}` : ''}

⸻`

    const config = {
      responseModalities: [Modality.AUDIO],
      mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Zephyr',
          }
        }
      },
      // Fixed context window compression config structure
      contextWindowCompression: {
        slidingWindow: { 
          targetTokens: '12800'  // String as required by API
        }
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
    }

    // Create streaming response
    const encoder = new TextEncoder()
    const audioParts: string[] = []

    const stream = new ReadableStream({
      async start(controller) {
        // Track controller state to prevent writing to closed controller
        const isControllerClosed = { value: false }
        
        try {
          // Clear previous session if exists
          if (activeSession) {
            activeSession.close()
          }

          // Start new Live session
          activeSession = await ai.live.connect({
            model,
            callbacks: {
              onopen: function () {
                console.log('Gemini Live session opened')
                if (!isControllerClosed.value) {
                  try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'session_started',
                      message: 'Live conversation started'
                    })}\n\n`))
                  } catch (error) {
                    console.error('Error sending session_started:', error)
                    isControllerClosed.value = true
                  }
                }
              },
              onmessage: function (message: LiveServerMessage) {
                responseQueue.push(message)
                handleModelTurn(message, controller, encoder, audioParts, isControllerClosed)
              },
              onerror: function (e: ErrorEvent) {
                console.error('Gemini Live error:', e.message)
                if (!isControllerClosed.value) {
                  try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'error',
                      message: e.message
                    })}\n\n`))
                  } catch (error) {
                    console.error('Error sending error message:', error)
                    isControllerClosed.value = true
                  }
                }
              },
              onclose: function (e: CloseEvent) {
                console.log('Gemini Live session closed:', e.reason)
                if (!isControllerClosed.value) {
                  try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      type: 'session_closed',
                      message: e.reason
                    })}\n\n`))
                    controller.close()
                    isControllerClosed.value = true
                  } catch (error) {
                    console.error('Error sending session_closed:', error)
                    isControllerClosed.value = true
                  }
                }
              },
            },
            config
          })

          // Send initial message with turnComplete flag
          if (message) {
            activeSession.sendClientContent({
              turns: [{
                role: 'user',
                parts: [{ text: message }]
              }],
              turnComplete: true  // Required to signal end of turn
            })
          }

        } catch (error) {
          console.error('Failed to start Live session:', error)
          if (!isControllerClosed.value) {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to start Live session'
              })}\n\n`))
              controller.close()
              isControllerClosed.value = true
            } catch (controllerError) {
              console.error('Error closing controller:', controllerError)
              isControllerClosed.value = true
            }
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })

  } catch (error: any) {
    console.error("Gemini Live API error:", error)
    return NextResponse.json({ 
      error: "API request failed",
      details: error.message 
    }, { status: 500 })
  }
}

function handleModelTurn(
  message: LiveServerMessage, 
  controller: ReadableStreamDefaultController, 
  encoder: TextEncoder, 
  audioParts: string[],
  isControllerClosed: { value: boolean }
) {
  // Check if controller is closed before attempting to write
  if (isControllerClosed.value) {
    console.log('Controller is closed, skipping message:', message.serverContent?.modelTurn?.parts?.[0]?.text?.slice(0, 50))
    return
  }

  try {
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent?.modelTurn?.parts?.[0]

      if (part?.fileData) {
        console.log(`File: ${part?.fileData.fileUri}`)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'file',
          fileUri: part?.fileData.fileUri
        })}\n\n`))
      }

      if (part?.inlineData) {
        const inlineData = part?.inlineData
        audioParts.push(inlineData?.data ?? '')

        // Convert to WAV and send as base64
        const buffer = convertToWav(audioParts, inlineData.mimeType ?? 'audio/pcm;rate=24000')
        const audioBase64 = buffer.toString('base64')

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'audio',
          audioData: `data:audio/wav;base64,${audioBase64}`,
          mimeType: 'audio/wav'
        })}\n\n`))
      }

      if (part?.text) {
        console.log('Live response:', part?.text)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'text',
          content: part?.text
        })}\n\n`))
      }
    }

    if (message.serverContent && message.serverContent.turnComplete) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'turn_complete'
      })}\n\n`))
    }
  } catch (error) {
    console.error('Error writing to controller:', error)
    isControllerClosed.value = true
  }
}

// GET endpoint for session status
export async function GET() {
  return NextResponse.json({
    message: "Gemini Live Conversation API is ready",
    features: {
      realTimeVoice: true,
      nativeAudio: true,
      contextualResponses: true,
      voiceStyles: ["Zephyr"],
      audioFormats: ["wav", "pcm"],
    },
    sessionActive: !!activeSession,
    timestamp: new Date().toISOString(),
  })
}

// Handle session cleanup
export async function DELETE() {
  if (activeSession) {
    activeSession.close()
    activeSession = undefined
    responseQueue.length = 0 // Clear queue
    return NextResponse.json({ message: "Session closed successfully" })
  }
  return NextResponse.json({ message: "No active session" })
} 