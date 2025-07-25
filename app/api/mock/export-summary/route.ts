import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { content, format, title } = await req.json()
    
    logMockActivity('export-summary', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.documentAnalysis))
    
    const mockSummary = {
      title: `[MOCK] ${title || 'Generated Summary'}`,
      summary: '[MOCK] This is a comprehensive summary of the provided content, highlighting key points and insights.',
      keyPoints: [
        'Important finding or insight',
        'Critical data point',
        'Key recommendation',
        'Action item'
      ],
      recommendations: [
        'Consider implementing the suggested approach',
        'Review the data for accuracy',
        'Follow up on identified opportunities'
      ],
      metadata: {
        format,
        wordCount: 150,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime
      },
      downloadUrl: '/api/mock/download/summary.pdf'
    }
    
    return NextResponse.json({
      ...mockSummary,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock export summary error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 