import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { prompt, enableTTS = false, voiceName = 'Puck' } = await req.json()
    
    logMockActivity('gemini-live', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.tts))
    
    const mockResponse = {
      success: true,
      content: MOCK_CONFIG.responses.tts(prompt),
      audioSupported: enableTTS,
      audioBase64: enableTTS ? 'mock_audio_base64_data_for_development' : null,
      voiceName,
      generatedAt: new Date().toISOString(),
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    }
    
    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock TTS error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Mock Gemini Live API is ready",
    features: {
      textGeneration: true,
      textToSpeech: true,
      audioStreaming: true,
      voiceStyles: ["neutral", "expressive", "calm", "energetic"],
      voiceNames: ["Kore", "Charon", "Fenrir", "Aoede"],
      audioFormats: ["mp3", "wav"],
    },
    mock: true,
    timestamp: new Date().toISOString(),
  })
} 