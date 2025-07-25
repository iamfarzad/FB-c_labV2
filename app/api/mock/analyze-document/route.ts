import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { data, mimeType, fileName } = await req.json()
    
    logMockActivity('analyze-document', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.documentAnalysis))
    
    const mockAnalysis = MOCK_CONFIG.responses.documentAnalysis()
    
    return NextResponse.json({
      ...mockAnalysis,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock document analysis error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 