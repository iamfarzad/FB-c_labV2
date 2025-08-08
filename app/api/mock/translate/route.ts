import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, targetLang } = body || {}
    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: 'Validation failed' }), { status: 400 })
    }
    const mocked = `[${targetLang.toUpperCase()} MOCK] ${text}`
    return new Response(JSON.stringify({ translated: mocked }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Mock failed', message: e?.message || 'Unknown' }), { status: 500 })
  }
}


