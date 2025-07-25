import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { messages, leadContext, sessionId } = await req.json()
    
    logMockActivity('chat', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.chat))
    
    // Mock response based on input
    const lastMessage = messages?.[messages.length - 1]?.content || ''
    const mockResponse = MOCK_CONFIG.responses.chat(lastMessage)
    
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
      error: 'Mock chat error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 