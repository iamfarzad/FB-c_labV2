import { NextRequest, NextResponse } from 'next/server'
import { WebcamCaptureSchema } from '@/lib/services/tool-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = WebcamCaptureSchema.parse(body)
    
    // Business logic for webcam capture processing
    const { imageData } = validatedData
    
    // Process image data (could include AI analysis, object detection, etc.)
    const imageSize = imageData.length
    const isBase64 = imageData.startsWith('data:image')
    
    // Basic image analysis
    const analysis = {
      format: isBase64 ? 'base64' : 'url',
      size: imageSize,
      hasData: imageSize > 0
    }
    
    const response = {
      status: 'success',
      data: {
        imageData,
        analysis,
        processedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Webcam capture API error:', error)
    
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
        details: 'Failed to process webcam capture'
      },
      { status: 500 }
    )
  }
} 