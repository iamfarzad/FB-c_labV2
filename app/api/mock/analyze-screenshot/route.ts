import { NextRequest, NextResponse } from 'next/server'
import { MOCK_CONFIG, logMockActivity, generateCorrelationId } from '@/lib/mock-config'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = generateCorrelationId()
  
  try {
    const { imageData, description, context } = await req.json()
    
    logMockActivity('analyze-screenshot', correlationId)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, MOCK_CONFIG.delays.imageAnalysis))
    
    const mockAnalysis = {
      summary: '[MOCK] This screenshot shows a business application interface with various UI elements and data displays.',
      keyInsights: [
        'Business process workflow identified',
        'Potential automation opportunities detected',
        'User interface optimization areas found'
      ],
      recommendations: [
        'Consider AI automation for repetitive tasks',
        'Implement process optimization strategies',
        'Explore digital transformation opportunities'
      ],
      painPoints: [
        'Manual processes that could be automated',
        'Data entry and processing inefficiencies',
        'Communication workflow bottlenecks'
      ]
    }
    
    return NextResponse.json({
      ...mockAnalysis,
      correlationId,
      responseTime: Date.now() - startTime,
      mock: true
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Mock screenshot analysis error',
      details: error instanceof Error ? error.message : 'Unknown error',
      correlationId
    }, { status: 500 })
  }
} 