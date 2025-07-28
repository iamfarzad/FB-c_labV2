import { NextRequest, NextResponse } from 'next/server'
import { VideoAppResultSchema } from '@/lib/services/tool-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = VideoAppResultSchema.parse(body)
    
    // Business logic for video app analysis
    const { analysis, recommendations, confidence } = validatedData
    
    // Process video analysis
    const processedAnalysis = analysis.trim()
    const analysisLength = processedAnalysis.length
    const hasRecommendations = recommendations && recommendations.length > 0
    
    const response = {
      status: 'success',
      data: {
        analysis: processedAnalysis,
        recommendations: recommendations || [],
        confidence: confidence || 0.8,
        analysisLength,
        hasRecommendations,
        processedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Video app API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Invalid input data',
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Internal server error',
        details: 'Failed to process video app analysis'
      },
      { status: 500 }
    )
  }
}
