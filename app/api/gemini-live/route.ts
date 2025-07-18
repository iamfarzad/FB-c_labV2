import { GoogleGenAI } from "@google/genai"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Audio format configuration
const AUDIO_CONFIG = {
  sampleRate: 24000,
  channels: 1,
  format: 'mp3' as const,
}

export async function POST(req: NextRequest) {
  try {
    const { 
      prompt, 
      enableTTS = false, 
      voiceStyle = "neutral",
      voiceName = "Kore",
      streamAudio = false 
    } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    if (enableTTS) {
      try {
        // Generate text content first
        const config = {
          responseMimeType: "text/plain",
        };

        const textResult = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          config,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        })
        
        const textResponse = textResult.responseId ? prompt : prompt

        // Use a proper TTS service - we'll use the browser's Speech Synthesis API via a helper
        const generateTTSAudio = async (text: string): Promise<string> => {
          try {
            // For server-side TTS, we'll use a more robust approach
            // Since we can't use browser APIs on the server, we'll return instructions
            // for the client to handle TTS, or use an external TTS service
            
            // Option 1: Use Google Cloud Text-to-Speech (if available)
            if (process.env.GOOGLE_CLOUD_TTS_API_KEY) {
              const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_TTS_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  input: { text },
                  voice: {
                    languageCode: 'en-US',
                    name: voiceName === 'Kore' ? 'en-US-Standard-A' : 'en-US-Standard-B',
                    ssmlGender: 'FEMALE'
                  },
                  audioConfig: {
                    audioEncoding: 'MP3',
                    sampleRateHertz: AUDIO_CONFIG.sampleRate
                  }
                })
              })
              
              if (response.ok) {
                const data = await response.json()
                return `data:audio/mp3;base64,${data.audioContent}`
              }
            }
            
            // Option 2: Use OpenAI TTS (if available)
            if (process.env.OPENAI_API_KEY) {
              const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'tts-1',
                  input: text,
                  voice: voiceStyle === 'neutral' ? 'alloy' : 'nova',
                  response_format: 'mp3'
                })
              })
              
              if (response.ok) {
                const audioBuffer = await response.arrayBuffer()
                const base64 = Buffer.from(audioBuffer).toString('base64')
                return `data:audio/mp3;base64,${base64}`
              }
            }
            
            // Option 3: Return text for client-side TTS
            return JSON.stringify({
              type: 'client_tts',
              text: text,
              voiceStyle: voiceStyle,
              voiceName: voiceName
            })
            
          } catch (error) {
            console.error('TTS generation failed:', error)
            // Fallback to client-side TTS
            return JSON.stringify({
              type: 'client_tts',
              text: text,
              voiceStyle: voiceStyle,
              voiceName: voiceName
            })
          }
        }

        const audioData = await generateTTSAudio(textResponse)

        if (streamAudio) {
          // Return streaming response for real-time audio playback
          const encoder = new TextEncoder()
          
          const stream = new ReadableStream({
            async start(controller) {
              try {
                // Send text first
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'text', 
                  content: textResponse 
                })}\n\n`))

                // Send audio data in chunks (simulated chunking)
                const chunkSize = 1024
                const audioChunks = audioData.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || []
                
                for (let i = 0; i < audioChunks.length; i++) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'audio_chunk',
                    chunk: audioChunks[i],
                    index: i,
                    total: audioChunks.length,
                    isLast: i === audioChunks.length - 1
                  })}\n\n`))
                  
                  // Small delay between chunks for streaming effect
                  await new Promise(resolve => setTimeout(resolve, 50))
                }

                // Send completion signal
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'complete',
                  audioConfig: AUDIO_CONFIG
                })}\n\n`))
                
                controller.close()
              } catch (error) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'error', 
                  error: error instanceof Error ? error.message : 'Audio generation failed' 
                })}\n\n`))
                controller.close()
              }
            },
          })

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
            },
          })
        } else {
          // Return complete audio response
          return NextResponse.json({
            success: true,
            textContent: textResponse,
            audioData: audioData,
            audioConfig: AUDIO_CONFIG,
            voiceStyle: voiceStyle,
            voiceName: voiceName,
            generatedAt: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("Gemini TTS generation error:", error)
        return NextResponse.json({ 
          error: "Failed to generate audio response",
          details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
      }
    } else {
      // Standard text-only generation
      const config = {
        responseMimeType: "text/plain",
      };

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        config,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })

      return NextResponse.json({
        success: true,
        content: prompt,
        audioSupported: false,
        generatedAt: new Date().toISOString(),
      })
    }
  } catch (error: any) {
    console.error("Gemini Live API error:", error)
    return NextResponse.json({ 
      error: "API request failed",
      details: error.message 
    }, { status: 500 })
  }
}

// GET endpoint for testing and configuration
export async function GET() {
  return NextResponse.json({
    message: "Gemini Live API is ready",
    features: {
      textGeneration: true,
      textToSpeech: true,
      audioStreaming: true,
      voiceStyles: ["neutral", "expressive", "calm", "energetic"],
      voiceNames: ["Kore", "Charon", "Fenrir", "Aoede"],
      audioFormats: ["mp3", "wav"],
    },
    config: AUDIO_CONFIG,
    timestamp: new Date().toISOString(),
  })
}
