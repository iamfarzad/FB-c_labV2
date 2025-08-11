import { NextRequest, NextResponse } from 'next/server'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

const rl = new Map<string, { count: number; reset: number }>()
const idem = new Map<string, { expires: number; body: any }>()
function checkRate(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const rec = rl.get(key)
  if (!rec || rec.reset < now) { rl.set(key, { count: 1, reset: now + windowMs }); return true }
  if (rec.count >= max) return false
  rec.count++; return true
}

// Minimal code/blueprint stub: echoes a blueprint string and records usage
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { spec } = body || {}
    const sessionId = req.headers.get('x-intelligence-session-id') || body?.sessionId || undefined
    const idemKey = req.headers.get('x-idempotency-key') || undefined

    const rlKey = `code:${sessionId || 'anon'}`
    if (!checkRate(rlKey, 10, 60_000)) return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    if (sessionId && idemKey) {
      const k = `${sessionId}:${idemKey}`
      const cached = idem.get(k)
      if (cached && cached.expires > Date.now()) return NextResponse.json(cached.body)
    }

    const blueprint = typeof spec === 'string' && spec.trim().length > 0
      ? spec.trim().slice(0, 8000)
      : 'No spec provided. This is a placeholder output for code/blueprint generation.'

    const response = { ok: true, output: blueprint }

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'code', { size: blueprint.length }) } catch {}
    }

    if (sessionId && idemKey) {
      const k = `${sessionId}:${idemKey}`
      idem.set(k, { expires: Date.now() + 5 * 60_000, body: response })
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
}


