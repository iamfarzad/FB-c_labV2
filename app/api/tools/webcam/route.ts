import { NextRequest, NextResponse } from 'next/server'
import { WebcamCaptureSchema } from '@/lib/services/tool-service'
import { isMockEnabled } from '@/lib/mock-control'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = WebcamCaptureSchema.parse(body)
    const { image } = validatedData
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined

    const analysis = {
      format: image.startsWith('data:image') ? 'base64' : 'url',
      size: image.length,
      hasData: image.length > 0
    }

    // For now webcam endpoint remains a simple echo analyzer; mock flag doesn’t change output
    const response = { ok: true, output: { image, analysis, processedAt: new Date().toISOString(), mock: isMockEnabled() } }

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'image', { analysis, imageSize: image.length, format: analysis.format }) } catch {}
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}


