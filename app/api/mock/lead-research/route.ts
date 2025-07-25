import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { name, email, company, linkedinUrl, researchActivityId } = await req.json()
    
    logMockActivity('lead-research', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.leadResearch))
    
    const mockResearch = MOCK_CONFIG.responses.leadResearch(name, company)
    
    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const researchText = JSON.stringify(mockResearch, null, 2)
        const chunks = researchText.match(/.{1,50}/g) || [researchText]
        
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          await new Promise(resolve => setTimeout(resolve, 100))
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
      error: 'Mock lead research error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 