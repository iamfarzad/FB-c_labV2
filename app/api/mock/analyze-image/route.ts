import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { image, type } = await req.json()
    
    logMockActivity('analyze-image', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.imageAnalysis))
    
    const mockAnalysis = MOCK_CONFIG.responses.imageAnalysis(type)
    
    return NextResponse.json({
      analysis: mockAnalysis,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock image analysis error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 