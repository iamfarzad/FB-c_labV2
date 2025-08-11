import { NextRequest, NextResponse } from 'next/server'
import { WebcamCaptureSchema } from '@/lib/services/tool-service'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = WebcamCaptureSchema.parse(body)
    
    // Business logic for webcam capture processing
    const { image, type } = validatedData
    
    // Process image data (could include AI analysis, object detection, etc.)
    const imageSize = image.length
    const isBase64 = image.startsWith('data:image')
    
    // Basic image analysis
    const analysis = {
      format: isBase64 ? 'base64' : 'url',
      size: imageSize,
      hasData: imageSize > 0
    }
    
    const response = {
      status: 'success',
      data: {
        image,
        analysis,
        processedAt: new Date().toISOString()
      }
    }
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'webcam', { analysis, imageSize: image.length, format: analysis.format }) } catch {}
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
