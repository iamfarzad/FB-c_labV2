import { NextRequest, NextResponse } from 'next/server'
import { ScreenShareSchema } from '@/lib/services/tool-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = ScreenShareSchema.parse(body)
    
    // Business logic for screen share analysis
    const { analysis, insights } = validatedData
    
    // Process screen share analysis
    const processedAnalysis = analysis.trim()
    const analysisLength = processedAnalysis.length
    const hasInsights = insights && insights.length > 0
    
    const response = {
      status: 'success',
      data: {
        analysis: processedAnalysis,
        insights: insights || [],
        analysisLength,
        hasInsights,
        processedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Screen share API error:', error)
    
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
        details: 'Failed to process screen share analysis'
      },
      { status: 500 }
    )
  }
} 