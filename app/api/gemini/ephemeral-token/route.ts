import { NextResponse } from 'next/server'

// Server-only: issue a short-lived ephemeral token for Gemini Live API.
// The client will use this token as an API key to open a direct Live session.
export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    // Lazy import server SDK
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString()

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        httpOptions: { apiVersion: 'v1alpha' },
        // Optional: lock model/response to reduce abuse if token is leaked
        // liveConnectConstraints: {
        //   model: 'gemini-live-2.5-flash-preview',
        //   config: { responseModalities: ['AUDIO', 'TEXT'], inputAudioTranscription: {} }
        // }
      },
    })

    return NextResponse.json({ token: token.name })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create token' }, { status: 500 })
  }
}


