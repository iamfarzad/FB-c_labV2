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

// Simple custom calculation: sum, avg, min, max; purely deterministic and cheap
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { values, op } = body || {}
    const sessionId = req.headers.get('x-intelligence-session-id') || body?.sessionId || undefined
    const idemKey = req.headers.get('x-idempotency-key') || undefined

    const rlKey = `calc:${sessionId || 'anon'}`
    if (!checkRate(rlKey, 20, 60_000)) return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    if (sessionId && idemKey) {
      const k = `${sessionId}:${idemKey}`
      const cached = idem.get(k)
      if (cached && cached.expires > Date.now()) return NextResponse.json(cached.body)
    }

    if (!Array.isArray(values) || values.length === 0) {
      return NextResponse.json({ ok: false, error: 'values[] required' }, { status: 400 })
    }

    const nums = values.map((v: any) => Number(v)).filter((n: number) => Number.isFinite(n))
    if (nums.length === 0) return NextResponse.json({ ok: false, error: 'no numeric values' }, { status: 400 })

    const sum = nums.reduce((a: number, b: number) => a + b, 0)
    const avg = sum / nums.length
    const min = Math.min(...nums)
    const max = Math.max(...nums)
    const output = op === 'sum' ? sum : op === 'avg' ? avg : op === 'min' ? min : op === 'max' ? max : { sum, avg, min, max }

    const response = { ok: true, output }

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'calc', { n: nums.length, op: op || 'stats' }) } catch {}
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


