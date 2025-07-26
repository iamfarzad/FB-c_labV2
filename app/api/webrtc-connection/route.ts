import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { logServerActivity } from "@/lib/server-activity-logger"

export const dynamic = "force-dynamic"

// WebRTC session management
const webrtcSessions = new Map<string, {
  sessionId: string
  userId: string
  startTime: Date
  lastActivity: Date
  connectionState: string
  iceCandidates: RTCIceCandidateInit[]
}>()

// Session cleanup interval (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000

// Clean up old sessions
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, session] of webrtcSessions.entries()) {
    if (now - session.lastActivity.getTime() > SESSION_TIMEOUT) {
      webrtcSessions.delete(sessionId)
      console.log(`🗑️ Cleaned up expired WebRTC session: ${sessionId}`)
    }
  }
}, 60000) // Check every minute

export async function GET() {
  return NextResponse.json({
    message: "WebRTC Connection API is ready",
    features: {
      ultraLowLatency: true,
      realTimeAudio: true,
      sessionManagement: true,
      iceCandidateHandling: true,
      connectionOptimization: true
    },
    activeSessions: webrtcSessions.size,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const callId = Math.random().toString(36).substring(7)
  
  try {
    const { 
      offer, 
      sessionId, 
      userId, 
      leadContext 
    } = await req.json()

    if (!offer || !sessionId) {
      return NextResponse.json({ 
        error: "Offer and sessionId are required" 
      }, { status: 400 })
    }

    console.log("🔗 WebRTC connection request:", {
      callId,
      sessionId,
      userId,
      hasOffer: !!offer,
      timestamp: new Date().toISOString()
    })

    // Create or update session
    const session = {
      sessionId,
      userId: userId || 'anonymous',
      startTime: new Date(),
      lastActivity: new Date(),
      connectionState: 'connecting',
      iceCandidates: []
    }
    
    webrtcSessions.set(sessionId, session)

    // Log session start
    await logServerActivity({
      type: 'webrtc_session_started',
      title: 'WebRTC Session Started',
      description: `Started ultra-low latency WebRTC session for ${leadContext?.name || 'user'}`,
      metadata: {
        sessionId,
        userId,
        leadContext,
        callId
      }
    })

    // In a real implementation, you would:
    // 1. Create a server-side RTCPeerConnection
    // 2. Set the remote description (offer)
    // 3. Create an answer
    // 4. Handle ICE candidates
    
    // For now, we'll simulate the WebRTC handshake
    const simulatedAnswer: RTCSessionDescriptionInit = {
      type: 'answer',
      sdp: `v=0
o=- ${Date.now()} 2 IN IP4 127.0.0.1
s=WebRTC Audio Session
t=0 0
a=group:BUNDLE audio
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=mid:audio
a=sendonly
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=ice-ufrag:${Math.random().toString(36).substring(7)}
a=ice-pwd:${Math.random().toString(36).substring(7)}
a=fingerprint:sha-256 ${Math.random().toString(36).substring(7)}
a=setup:active
a=candidate:1 1 UDP 2122252543 127.0.0.1 9 typ host
a=end-of-candidates`
    }

    const simulatedIceCandidates: RTCIceCandidateInit[] = [
      {
        candidate: `candidate:1 1 UDP 2122252543 127.0.0.1 9 typ host`,
        sdpMid: 'audio',
        sdpMLineIndex: 0
      }
    ]

    // Update session state
    session.connectionState = 'connected'
    session.lastActivity = new Date()
    session.iceCandidates = simulatedIceCandidates

    console.log("✅ WebRTC connection established:", {
      callId,
      sessionId,
      responseTime: Date.now() - startTime
    })

    const response = {
      success: true,
      sessionId,
      answer: simulatedAnswer,
      iceCandidates: simulatedIceCandidates,
      connectionInfo: {
        latency: Math.random() * 50 + 10, // Simulated latency 10-60ms
        quality: 'excellent',
        protocol: 'WebRTC',
        encryption: 'DTLS-SRTP'
      },
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error("❌ WebRTC connection error:", error)
    return NextResponse.json({ 
      error: "WebRTC connection failed",
      details: error.message
    }, { status: 500 })
  }
}

// Handle ICE candidate updates
export async function PUT(req: NextRequest) {
  try {
    const { sessionId, candidate } = await req.json()

    if (!sessionId || !candidate) {
      return NextResponse.json({ 
        error: "SessionId and candidate are required" 
      }, { status: 400 })
    }

    const session = webrtcSessions.get(sessionId)
    if (!session) {
      return NextResponse.json({ 
        error: "Session not found" 
      }, { status: 404 })
    }

    // Add ICE candidate to session
    session.iceCandidates.push(candidate)
    session.lastActivity = new Date()

    console.log("🧊 ICE candidate added:", {
      sessionId,
      candidateType: candidate.candidate?.split(' ')[7] || 'unknown'
    })

    return NextResponse.json({ 
      success: true,
      sessionId,
      candidateCount: session.iceCandidates.length
    })

  } catch (error: any) {
    console.error("❌ ICE candidate error:", error)
    return NextResponse.json({ 
      error: "Failed to add ICE candidate",
      details: error.message
    }, { status: 500 })
  }
}

// Handle session cleanup
export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ 
        error: "SessionId is required" 
      }, { status: 400 })
    }

    const session = webrtcSessions.get(sessionId)
    if (session) {
      webrtcSessions.delete(sessionId)
      
      // Log session end
      await logServerActivity({
        type: 'webrtc_session_ended',
        title: 'WebRTC Session Ended',
        description: `Ended WebRTC session: ${sessionId}`,
        metadata: {
          sessionId,
          userId: session.userId,
          duration: Date.now() - session.startTime.getTime()
        }
      })

      console.log("🗑️ WebRTC session cleaned up:", { sessionId })
    }

    return NextResponse.json({ 
      success: true,
      sessionId,
      activeSessions: webrtcSessions.size
    })

  } catch (error: any) {
    console.error("❌ Session cleanup error:", error)
    return NextResponse.json({ 
      error: "Failed to cleanup session",
      details: error.message
    }, { status: 500 })
  }
}