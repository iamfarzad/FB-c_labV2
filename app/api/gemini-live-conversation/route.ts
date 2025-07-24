import { GoogleGenAI } from "@google/genai"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { supabaseService } from "@/lib/supabase/client"
import { logServerActivity } from "@/lib/server-activity-logger"

export const dynamic = "force-dynamic"

// Real-time conversation session management
const activeSessions = new Map<string, {
  sessionId: string
  leadId?: string
  startTime: Date
  lastActivity: Date
  messageCount: number
  audioEnabled: boolean
}>()

// Session cleanup interval (5 minutes)
const SESSION_TIMEOUT = 5 * 60 * 1000

// Clean up old sessions
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity.getTime() > SESSION_TIMEOUT) {
      activeSessions.delete(sessionId)
      console.log(`🗑️ Cleaned up expired session: ${sessionId}`)
    }
  }
}, 60000) // Check every minute

export async function GET() {
  return NextResponse.json({
    message: "Gemini Live Conversation API is ready",
    features: {
      realTimeVoice: true,
      nativeAudio: true,
      sessionManagement: true,
      leadIntegration: true,
      activityLogging: true,
      audioFormats: ["wav", "mp3"],
      voiceStyles: ["neutral", "expressive", "calm", "energetic"],
      voiceNames: ["Kore", "Charon", "Fenrir", "Aoede", "Puck"],
    },
    sessionActive: activeSessions.size,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const sessionId = Math.random().toString(36).substring(7)
  
  try {
    const { 
      message, 
      leadContext,
      sessionId: existingSessionId,
      enableAudio = false,
      voiceName = 'Puck',
      languageCode = 'en-US',
      action = 'message' // 'message', 'start', 'end'
    } = await req.json()

    // Use existing session or create new one
    const currentSessionId = existingSessionId || sessionId
    let session = activeSessions.get(currentSessionId)

    if (action === 'start') {
      // Start new conversation session
      session = {
        sessionId: currentSessionId,
        leadId: leadContext?.leadId,
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        audioEnabled: enableAudio
      }
      activeSessions.set(currentSessionId, session)

      // Log session start
      await logServerActivity({
        type: 'conversation_started',
        title: 'Live Conversation Started',
        description: `Started live conversation with ${leadContext?.leadName || 'user'}`,
        metadata: {
          sessionId: currentSessionId,
          leadId: leadContext?.leadId,
          audioEnabled: enableAudio,
          voiceName,
          languageCode
        }
      })

      console.log("🎙️ Live conversation started:", {
        sessionId: currentSessionId,
        leadId: leadContext?.leadId,
        audioEnabled: enableAudio
      })

      return NextResponse.json({
        success: true,
        sessionId: currentSessionId,
        message: "Conversation session started",
        features: {
          realTimeVoice: true,
          nativeAudio: true,
          sessionManagement: true
        }
      })
    }

    if (action === 'end') {
      // End conversation session
      if (session) {
        activeSessions.delete(currentSessionId)
        
        // Log session end
        await logServerActivity({
          type: 'conversation_ended',
          title: 'Live Conversation Ended',
          description: `Ended live conversation after ${session.messageCount} messages`,
          metadata: {
            sessionId: currentSessionId,
            leadId: session.leadId,
            messageCount: session.messageCount,
            duration: Date.now() - session.startTime.getTime()
          }
        })

        console.log("🔚 Live conversation ended:", {
          sessionId: currentSessionId,
          messageCount: session.messageCount,
          duration: Date.now() - session.startTime.getTime()
        })
      }

      return NextResponse.json({
        success: true,
        message: "Conversation session ended"
      })
    }

    // Handle message
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Update session
    if (session) {
      session.lastActivity = new Date()
      session.messageCount++
    }

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    // Generate response
    console.log("💬 Processing live message:", {
      sessionId: currentSessionId,
      messageLength: message.length,
      audioEnabled: enableAudio
    })

    const config = {
      responseMimeType: "text/plain",
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      config,
      contents: [{ role: "user", parts: [{ text: message }] }],
    })

    // Generate a proper AI response - use a simple response for now
    const responseText = `Thank you for your message: "${message}". I'm here to help with your business needs. How can I assist you today?`

    // Log message activity
    await logServerActivity({
      type: 'chat_message',
      title: 'Live Chat Message',
      description: `Live conversation message: ${message.substring(0, 100)}...`,
      metadata: {
        sessionId: currentSessionId,
        leadId: session?.leadId,
        messageLength: message.length,
        responseLength: responseText.length,
        audioEnabled: enableAudio
      }
    })

    // Generate audio if requested
    let audioData = null
    if (enableAudio && session?.audioEnabled) {
      try {
        console.log("🎤 Generating audio for live response")
        
        const ttsResponse = await genAI.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ role: "user", parts: [{ text: responseText }] }],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              },
              languageCode: languageCode
            }
          }
        })

        const audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
        if (audio) {
          audioData = `data:audio/wav;base64,${audio}`
          console.log("✅ Audio generated for live response")
        }
      } catch (error) {
        console.error("❌ Audio generation failed:", error)
      }
    }

    const response = {
      success: true,
      sessionId: currentSessionId,
      message: responseText,
      audioData,
      messageCount: session?.messageCount || 1,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }

    // Update lead context if provided
    if (leadContext?.leadId && session?.leadId) {
      try {
        await supabaseService
          .from('lead_summaries')
          .update({
            conversation_summary: `Live conversation: ${responseText.substring(0, 200)}...`,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.leadId)
      } catch (error) {
        console.error("Failed to update lead conversation summary:", error)
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error("❌ Live conversation error:", error)
    return NextResponse.json({ 
      error: "Live conversation failed",
      details: error.message
    }, { status: 500 })
  }
} 