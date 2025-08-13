import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

// Simple per-session token cache + rate limit + idempotency
const tokens = new Map<string, { token: string; expiresAt: number }>()
const rl = new Map<string, { count: number; reset: number }>()
const idem = new Map<string, { body: any; expires: number }>()
function checkRate(key: string, max: number, windowMs: number) {
  const now = Date.now(); const rec = rl.get(key)
  if (!rec || rec.reset < now) { rl.set(key, { count: 1, reset: now + windowMs }); return true }
  if (rec.count >= max) return false
  rec.count++; return true
}

// Issues previously hit: unreliable turn-end and VAD thresholds.
// This endpoint is only to mint a short-lived token placeholder and record 'voice' capability on first connect.
// In production, replace `token` with a real ephemeral token flow.

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const idemKey = req.headers.get('x-idempotency-key') || undefined

    const rlKey = `live:${sessionId || 'anon'}`
    if (!checkRate(rlKey, 6, 60_000)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    if (sessionId && idemKey) {
      const hit = idem.get(`${sessionId}:${idemKey}`)
      if (hit && hit.expires > Date.now()) return NextResponse.json(hit.body)
    }

    // Reuse existing token if not expired
    if (sessionId) {
      const cached = tokens.get(sessionId)
      if (cached && cached.expiresAt > Date.now() + 10_000) {
        const body = { token: cached.token, expiresAt: cached.expiresAt }
        if (idemKey) idem.set(`${sessionId}:${idemKey}`, { body, expires: Date.now() + 5 * 60_000 })
        return NextResponse.json(body)
      }
    }

    // Mint new ephemeral token using server SDK
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey })
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString()
    const minted = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        httpOptions: { apiVersion: 'v1alpha' },
      },
    })
    // SDKs have returned different field names across versions; prefer explicit value fields
    const token = (minted as any)?.token || (minted as any)?.clientToken || (minted as any)?.value || (minted as any)?.name
    const expiresAt = Date.now() + 30 * 60_000
    if (sessionId) tokens.set(sessionId, { token, expiresAt })

    // Record capability only when minting a new token
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'voice', { event: 'connect' }) } catch {}
    }

    const body = { token, expiresAt }
    if (sessionId && idemKey) idem.set(`${sessionId}:${idemKey}`, { body, expires: Date.now() + 5 * 60_000 })
    return NextResponse.json(body, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to mint token' }, { status: 500 })
  }
}


