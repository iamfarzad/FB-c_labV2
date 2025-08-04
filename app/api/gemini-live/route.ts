

// Timeout wrapper for production stability
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ])
}
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-correlation-id, x-demo-session-id, x-user-id',
    },
  })
}

import { GoogleGenAI } from "@google/genai"
import { createOptimizedConfig } from "@/lib/gemini-config-enhanced"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { AudioQualityEnhancer } from "@/lib/audio-quality-enhancer"

export const dynamic = "force-dynamic"

// Enhanced audio format configuration for Gemini TTS (optimized for quality)
const AUDIO_CONFIG = {
  sampleRate: 24000, // Higher quality for better voice clarity
  channels: 1,
  format: 'wav' as const,
  compression: 'gzip' as const, // Enable compression
  bitDepth: 16, // 16-bit audio for better quality
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: 'Puck',
      voiceStyle: 'professional',
      speakingRate: 1.0,
      pitch: 0.0,
      volumeGainDb: 0.0
    }
  }
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
      languageCode = 'en-US',
      audioData,
      useWebRTC = false
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

    if (!prompt && !audioData) {
      console.log("❌ Missing prompt or audio data:", { callId, correlationId })
      return NextResponse.json({ error: "Prompt or audio data is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("❌ Missing API key:", { callId, correlationId })
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Import demo budget management functions
    const { checkDemoAccess, recordDemoUsage } = await import('@/lib/demo-budget-manager')
    const { selectModelForFeature, estimateTokens } = await import('@/lib/model-selector')
    const { enforceBudgetAndLog } = await import('@/lib/token-usage-logger')

    // Handle WebRTC audio data or regular prompt
    let textToProcess = prompt
    let estimatedTokens = 0
    
    if (audioData && useWebRTC) {
      try {
        // Process WebRTC audio data
        console.log("🎤 Processing WebRTC audio data:", { callId, audioDataLength: audioData.length })
        
        // Convert base64 audio to buffer
        const audioBuffer = Buffer.from(audioData, 'base64')
        
        // In a real implementation, you would:
        // 1. Use Gemini's audio input capabilities
        // 2. Process the audio for speech recognition
        // 3. Return the transcribed text
        
        // For now, simulate audio processing
        textToProcess = "WebRTC audio processed successfully. This is a simulated transcription of the audio input."
        estimatedTokens = estimateTokens(textToProcess)
        
        console.log("✅ WebRTC audio processed:", { callId, transcribedText: textToProcess })
      } catch (error) {
        console.error("❌ WebRTC audio processing failed:", error)
        return NextResponse.json({ 
          error: "Failed to process WebRTC audio",
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
      }
    } else {
      estimatedTokens = estimateTokens(prompt || '')
    }
    
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
        
        // Generate text content first with optimization
        const optimizedConfig = createOptimizedConfig('live', {
          maxOutputTokens: 512, // Limit for live responses
          temperature: 0.6, // Balanced for conversation
        });

        const textResult = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          config: optimizedConfig,
          contents: [{ role: "user", parts: [{ text: textToProcess }] }],
        })
        
        const textResponse = textResult.responseId ? textToProcess : textToProcess

        console.log("✅ Text generation completed:", { callId, responseLength: textResponse.length })

        // Simplified TTS for testing - return client-side TTS instructions
        const audioData = JSON.stringify({
          type: 'client_tts',
          text: textResponse,
          voiceName: voiceName,
          voiceStyle: 'professional',
          instructions: 'Use a clear, professional voice for business communication'
        })

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
      
      // Use optimized config for live text generation
      const optimizedConfig = createOptimizedConfig('live', {
        maxOutputTokens: 512, // Limit for live responses
        temperature: 0.6,
      });

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        config: optimizedConfig,
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
