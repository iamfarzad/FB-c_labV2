import { NextRequest, NextResponse } from 'next/server'
import { VoiceTranscriptSchema } from '@/lib/services/tool-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = VoiceTranscriptSchema.parse(body)
    
    // Business logic for voice transcript processing
    const { transcript } = validatedData
    
    // Process transcript (could include AI analysis, sentiment detection, etc.)
    const processedTranscript = transcript.trim()
    const wordCount = processedTranscript.split(' ').length
    const estimatedDuration = wordCount * 0.5 // Rough estimate: 2 words per second
    
    const response = {
      status: 'success',
      data: {
        transcript: processedTranscript,
        wordCount,
        estimatedDuration,
        processedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Voice transcript API error:', error)
    
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
        details: 'Failed to process voice transcript'
      },
      { status: 500 }
    )
  }
}
