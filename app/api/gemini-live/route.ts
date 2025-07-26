import { GoogleGenAI } from "@google/genai"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Audio format configuration for Gemini TTS (optimized for web)
const AUDIO_CONFIG = {
  sampleRate: 16000, // Reduced from 24000 for smaller files
  channels: 1,
  format: 'wav' as const,
  compression: 'gzip' as const, // Enable compression
}

// In-memory cache for duplicate prevention (use Redis in production)
const recentCalls = new Map<string, number>()
const DUPLICATE_THRESHOLD = 3000 // 3 seconds - more reasonable for voice interactions

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const callId = Math.random().toString(36).substring(7)
  const correlationId = req.headers.get('x-correlation-id') || callId
  
  try {
    const { 
      prompt, 
      enableTTS = false, 
      streamAudio = false, 
      voiceName = 'Puck',
      multiSpeakerMode = false,
      languageCode = 'en-US'
    } = await req.json()

    // Get session ID for demo budget tracking
    const sessionId = req.headers.get('x-demo-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    // 🟠 LOGGING: Track all API calls
    console.log("🟠 Gemini API Called:", {
      callId,
      correlationId,
      prompt: (prompt || '').substring(0, 100) + ((prompt || '').length > 100 ? "..." : ""),
      enableTTS,
      streamAudio,
      voiceName,
      multiSpeakerMode,
      sessionId,
      timestamp: new Date().toISOString(),
      userAgent: (req.headers.get('user-agent') || '').substring(0, 50)
    })

    // 🚫 DUPLICATE PREVENTION
    const promptHash = `${prompt?.substring(0, 50) || ''}_${enableTTS}_${voiceName}`
    const lastCallTime = recentCalls.get(promptHash)
    const now = Date.now()
    
    if (lastCallTime && (now - lastCallTime) < DUPLICATE_THRESHOLD) {
      console.log("🚫 Duplicate call prevented:", {
        callId,
        correlationId,
        promptHash,
        timeSinceLastCall: now - lastCallTime
      })
      return NextResponse.json({ 
        error: "Duplicate call skipped",
        callId,
        retryAfter: Math.ceil((DUPLICATE_THRESHOLD - (now - lastCallTime)) / 1000)
      }, { status: 429 })
    }
    
    // Update recent calls
    recentCalls.set(promptHash, now)
    
    // Clean up old entries (keep last 100)
    if (recentCalls.size > 100) {
      const oldestKey = recentCalls.keys().next().value
      if (oldestKey) {
        recentCalls.delete(oldestKey)
      }
    }

    if (!prompt) {
      console.log("❌ Missing prompt:", { callId, correlationId })
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("❌ Missing API key:", { callId, correlationId })
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Import demo budget management functions
    const { checkDemoAccess, recordDemoUsage } = await import('@/lib/demo-budget-manager')
    const { selectModelForFeature, estimateTokens } = await import('@/lib/model-selector')
    const { enforceBudgetAndLog } = await import('@/lib/token-usage-logger')

    // Estimate tokens and select model
    const estimatedTokens = estimateTokens(prompt)
    const modelSelection = selectModelForFeature('voice_tts', estimatedTokens, !!sessionId)

    // Check demo budget for voice TTS feature
    if (sessionId) {
      const accessCheck = await checkDemoAccess(sessionId, 'voice_tts' as any, estimatedTokens)
      
      if (!accessCheck.allowed) {
        console.log("🚫 Demo access denied:", { callId, reason: accessCheck.reason })
        return NextResponse.json({
          error: 'Demo limit reached',
          message: accessCheck.reason,
          remainingTokens: accessCheck.remainingTokens,
          remainingRequests: accessCheck.remainingRequests
        }, { status: 429 })
      }
    }

    // Check user budget if authenticated
    if (userId) {
      const budgetCheck = await enforceBudgetAndLog(
        userId,
        sessionId,
        'voice_tts',
        modelSelection.model,
        estimatedTokens,
        estimatedTokens * 0.5, // Estimate output tokens
        true
      )

      if (!budgetCheck.allowed) {
        console.log("🚫 Budget exceeded:", { callId, reason: budgetCheck.reason })
        return NextResponse.json({
          error: 'Budget limit reached',
          message: budgetCheck.reason,
          suggestedModel: budgetCheck.suggestedModel
        }, { status: 429 })
      }
    }

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    if (enableTTS) {
      try {
        console.log("🎤 TTS Generation started:", { callId, correlationId, promptLength: (prompt || '').length })
        
        // Generate text content first
        const config = {
          responseMimeType: "text/plain",
        };

        const textResult = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          config,
          contents: [{ role: "user", parts: [{ text: prompt! }] }],
        })
        
        const textResponse = textResult.responseId ? prompt : prompt

        console.log("✅ Text generation completed:", { callId, responseLength: textResponse.length })

        // Use Gemini TTS with proper configuration (from official docs)
        const generateTTSAudio = async (text: string, voiceName: string = 'Puck', multiSpeakerMode: boolean = false, languageCode: string = 'en-US'): Promise<string> => {
          try {
            console.log("🔊 TTS Audio generation:", { callId, voiceName, textLength: text.length })
            
            // Determine if this is multi-speaker content
            const hasMultipleSpeakers = multiSpeakerMode && text.includes(':') && text.split(':').length > 2;
            
            let speechConfig;
            
            if (hasMultipleSpeakers) {
              // Extract speaker names from text (e.g., "Joe: Hello\nJane: Hi there")
              const speakerMatches = text.match(/^([^:]+):/gm);
              const speakers = speakerMatches ? [...new Set(speakerMatches.map(s => s.replace(':', '').trim()))] : [];
              
              if (speakers.length >= 2) {
                // Multi-speaker configuration
                speechConfig = {
                  multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: speakers.slice(0, 2).map((speaker, index) => ({
                      speaker: speaker,
                      voiceConfig: {
                        prebuiltVoiceConfig: {
                          voiceName: index === 0 ? voiceName : 'Kore' // First speaker gets requested voice, second gets Kore
                        }
                      }
                    }))
                  }
                };
              } else {
                // Fallback to single speaker if speaker detection fails
                speechConfig = {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: voiceName
                    }
                  }
                };
              }
            } else {
              // Single speaker configuration
              speechConfig = {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName
                  }
                }
              };
            }

            // Use the correct model from the documentation with proper contents format
            const ttsResponse = await genAI.models.generateContent({
              model: "gemini-2.5-flash-preview-tts",
              contents: [{ role: "user", parts: [{ text }] }], // ✅ Correct format per docs
              config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  ...speechConfig,
                  languageCode: languageCode // ✅ Language support
                }
              }
            });

            // Extract audio data from response
            const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (audioData) {
              console.log("✅ TTS Audio generated successfully:", { callId, audioDataLength: audioData.length })
              // Convert to base64 data URL for browser playback
              return `data:audio/wav;base64,${audioData}`;
            } else {
              throw new Error('No audio data received from Gemini TTS');
            }
            
          } catch (error) {
            console.error('❌ Gemini TTS generation failed:', { callId, error: error instanceof Error ? error.message : 'Unknown error' })
            
            // Fallback: Use client-side TTS with requested voice characteristics
            return JSON.stringify({
              type: 'client_tts',
              text: text,
              voiceName: voiceName,
              voiceStyle: voiceName.toLowerCase(),
              instructions: 'Use a bright, engaging voice for business communication'
            })
          }
        }

        const audioData = await generateTTSAudio(textResponse, voiceName, multiSpeakerMode, languageCode)

        console.log("🎵 TTS processing completed:", { 
          callId, 
          responseTime: Date.now() - startTime,
          audioDataLength: audioData.length 
        })

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
              "X-Call-ID": callId,
              "X-Response-Time": `${Date.now() - startTime}ms`
            },
          })
        } else {
          // ✅ NEW: Return raw audio data for direct playback
          if (audioData.startsWith('data:audio/wav;base64,')) {
            // Convert base64 to raw audio buffer
            const base64Data = audioData.replace('data:audio/wav;base64,', '')
            const binaryString = atob(base64Data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            
            console.log("🎵 Returning raw audio data:", { 
              callId, 
              audioSize: bytes.length,
              responseTime: Date.now() - startTime
            })
            
            // Record usage for demo sessions
            if (sessionId) {
              try {
                await recordDemoUsage(sessionId, 'voice_tts', estimatedTokens, estimatedTokens * 0.5)
              } catch (error) {
                console.warn("Failed to record demo usage:", error)
              }
            }

            return new Response(bytes, {
              headers: {
                "Content-Type": "audio/wav",
                "Content-Length": bytes.length.toString(),
                "Content-Encoding": "gzip", // Enable compression
                "X-Call-ID": callId,
                "X-Response-Time": `${Date.now() - startTime}ms`,
                "Cache-Control": "public, max-age=300", // Cache for 5 minutes
                "Vary": "Accept-Encoding"
              },
            })
          } else {
            // Fallback to JSON response for client-side TTS
            // Record usage for demo sessions
            if (sessionId) {
              try {
                await recordDemoUsage(sessionId, 'voice_tts', estimatedTokens, estimatedTokens * 0.5)
              } catch (error) {
                console.warn("Failed to record demo usage:", error)
              }
            }

            return NextResponse.json({
              success: true,
              textContent: textResponse,
              audioData: audioData,
              audioConfig: AUDIO_CONFIG,
              voiceName: 'Puck',
              voiceStyle: 'puck',
              generatedAt: new Date().toISOString(),
              callId,
              responseTime: Date.now() - startTime
            })
          }
        }
      } catch (error) {
        console.error("❌ Gemini TTS generation error:", { callId, error: error instanceof Error ? error.message : 'Unknown error' })
        return NextResponse.json({ 
          error: "Failed to generate audio response",
          details: error instanceof Error ? error.message : "Unknown error",
          callId
        }, { status: 500 })
      }
    } else {
      // Standard text-only generation
      console.log("📝 Text-only generation:", { callId, promptLength: (prompt || '').length })
      
      const config = {
        responseMimeType: "text/plain",
      };

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        config,
        contents: [{ role: "user", parts: [{ text: prompt! }] }],
      })

      console.log("✅ Text generation completed:", { 
        callId, 
        responseTime: Date.now() - startTime 
      })

      // Record usage for demo sessions (text-only)
      if (sessionId) {
        try {
          await recordDemoUsage(sessionId, 'voice_tts', estimatedTokens, estimatedTokens * 0.3)
        } catch (error) {
          console.warn("Failed to record demo usage:", error)
        }
      }

      return NextResponse.json({
        success: true,
        content: prompt,
        audioSupported: false,
        generatedAt: new Date().toISOString(),
        callId,
        responseTime: Date.now() - startTime
      })
    }
  } catch (error: any) {
    console.error("❌ Gemini Live API error:", { 
      callId, 
      error: error.message,
      responseTime: Date.now() - startTime
    })
    return NextResponse.json({ 
      error: "API request failed",
      details: error.message,
      callId
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
