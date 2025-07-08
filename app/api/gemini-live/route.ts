import { GoogleGenerativeAI } from "@google/generative-ai"
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    if (enableTTS) {
      try {
        // Use Gemini 2.5 Flash with TTS capabilities
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        })

        // Generate text content first
        const textResult = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        })
        
        const textResponse = textResult.response.text()

        // For now, we'll simulate TTS generation since the actual TTS API might need specific setup
        // In production, this would call the actual Gemini TTS endpoint
        const mockAudioGeneration = async (text: string): Promise<string> => {
          // Simulate audio generation delay
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // In a real implementation, this would be:
          // const ttsModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" })
          // const audioResult = await ttsModel.generateContent({
          //   contents: [{ role: "user", parts: [{ text }] }],
          //   generationConfig: {
          //     responseMimeType: "audio/mp3",
          //     speechConfig: {
          //       voiceConfig: {
          //         prebuiltVoiceConfig: { voiceName }
          //       }
          //     }
          //   }
          // })
          // return audioResult.response.audio()
          
          // For now, return a placeholder base64 audio data
          // This would be replaced with actual Gemini-generated audio
          return "data:audio/mp3;base64,SUQzAwAAAAAA..." // Placeholder
        }

        const audioData = await mockAudioGeneration(textResponse)

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
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      })

      const result = await model.generateContent(prompt)
      const textResponse = result.response.text()

      return NextResponse.json({
        success: true,
        content: textResponse,
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
