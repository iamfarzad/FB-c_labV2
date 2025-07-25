import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function GET() {
  return NextResponse.json({
    message: "Mock Gemini Live Conversation API is ready",
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
    sessionActive: 0,
    mock: true,
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { message, action = 'message', sessionId, leadContext, enableAudio = false, voiceName = 'Puck' } = await req.json()
    
    logMockActivity('gemini-live-conversation', correlationId)
    
    if (action === 'start') {
      return NextResponse.json({
        success: true,
        sessionId: sessionId || 'mock-session-' + Math.random().toString(36).substring(7),
        message: "Mock conversation session started",
        features: {
          realTimeVoice: true,
          nativeAudio: true,
          sessionManagement: true
        },
        mock: true,
        correlationId
      })
    }
    
    if (action === 'end') {
      return NextResponse.json({
        success: true,
        message: "Mock conversation session ended",
        mock: true,
        correlationId
      })
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const mockResponse = {
      success: true,
      response: `[MOCK LIVE] Thank you for your message: "${message?.substring(0, 50)}...". I'm here to help with your business needs. This is a development mock response for live conversation.`,
      sessionId: sessionId || 'mock-session-' + Math.random().toString(36).substring(7),
      audioEnabled: enableAudio,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    }
    
    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock live conversation error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 