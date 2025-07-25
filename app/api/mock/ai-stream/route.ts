import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { prompt, conversationHistory, enableStreaming = true, sessionId } = await req.json()
    
    logMockActivity('ai-stream', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.chat))
    
    const mockResponse = `[MOCK STREAM] Thank you for your message: "${prompt?.substring(0, 50)}...". I'm here to help with your business needs. This is a development mock streaming response.`
    
    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = mockResponse.match(/.{1,20}/g) || [mockResponse]
        
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Correlation-ID': correlationId,
        'X-Mock-Response': 'true',
        'X-Response-Time': `${Date.now() - startTime}ms`
      },
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock AI stream error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 