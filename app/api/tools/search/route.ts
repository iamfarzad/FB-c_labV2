import { NextRequest, NextResponse } from 'next/server'
import { GoogleGroundingProvider } from '@/lib/intelligence/providers/search/google-grounding'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

const groundingProvider = new GoogleGroundingProvider()

// Per-session rate limit + optional idempotency
const rl = new Map<string, { count: number; reset: number }>()
const idem = new Map<string, { expires: number; body: any }>()
function checkRate(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const rec = rl.get(key)
  if (!rec || rec.reset < now) { rl.set(key, { count: 1, reset: now + windowMs }); return true }
  if (rec.count >= max) return false
  rec.count++; return true
}

export async function POST(request: NextRequest) {
  try {
    const { query, sessionId, urls } = await request.json()
    const headerSessionId = request.headers.get('x-intelligence-session-id') || undefined
    const effectiveSessionId = sessionId || headerSessionId
    const idemKey = request.headers.get('x-idempotency-key') || undefined

    if (!query) {
      return NextResponse.json({ ok: false, error: 'Query is required' }, { status: 400 })
    }

    const rlKey = `search:${effectiveSessionId || 'anon'}`
    if (!checkRate(rlKey, 10, 60_000)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    if (effectiveSessionId && idemKey) {
      const k = `${effectiveSessionId}:${idemKey}`
      const cached = idem.get(k)
      if (cached && cached.expires > Date.now()) return NextResponse.json(cached.body)
    }

    console.info('🔍 Generic search request:', { query, sessionId })

    // Apply env gating for URL context
    const urlContextEnabled = (process.env.URL_CONTEXT_ENABLED ?? 'true') === 'true'
    const urlContextMax = Number(process.env.URL_CONTEXT_MAX_URLS ?? 10)
    const allowed = String(process.env.URL_CONTEXT_ALLOWED_DOMAINS ?? '')
      .split(',').map(s => s.trim()).filter(Boolean)
    const filteredUrls = Array.isArray(urls)
      ? urls.filter(u => {
          if (!allowed.length) return true
          try { const h = new URL(u).hostname; return allowed.some(d => h === d || h.endsWith(`.${d}`)) } catch { return false }
        }).slice(0, urlContextMax)
      : undefined
    // Perform grounded search (optionally include URL context)
    const result = await groundingProvider.groundedAnswer(query, urlContextEnabled ? filteredUrls : undefined)

    // Record capability usage if session is available
    if (effectiveSessionId) {
      try {
        await recordCapabilityUsed(String(effectiveSessionId), 'search', {
          queryLength: String(query).length,
          citations: Array.isArray(result.citations) ? result.citations.length : 0,
        })
        console.info('✅ Recorded search capability for session:', effectiveSessionId)
      } catch {}
    }

    const body = { ok: true, output: { answer: result.text, citations: result.citations, query, sessionId: effectiveSessionId, urls: Array.isArray(urls) ? urls : undefined } }

    if (effectiveSessionId && idemKey) {
      idem.set(`${effectiveSessionId}:${idemKey}`, { expires: Date.now() + 5 * 60_000, body })
    }

    return NextResponse.json(body)

  } catch (error) {
    console.error('❌ Search tool error:', error)
    return NextResponse.json({ ok: false, error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}


