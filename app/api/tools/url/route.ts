import { NextRequest, NextResponse } from 'next/server'
import URLContextService from '@/lib/services/url-context-service'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

// Simple per-session rate limiter and idempotency cache (in-memory)
const rl = new Map<string, { count: number; reset: number }>()
const idem = new Map<string, { expires: number; body: any }>()

function checkRate(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const rec = rl.get(key)
  if (!rec || rec.reset < now) {
    rl.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (rec.count >= max) return false
  rec.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { url, text } = body || {}
    const sessionId = req.headers.get('x-intelligence-session-id') || body?.sessionId || undefined
    const idemKey = req.headers.get('x-idempotency-key') || undefined

    // Rate limit per session
    const rlKey = `url:${sessionId || 'anon'}`
    if (!checkRate(rlKey, 10, 60_000)) {
      return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Idempotency (optional via header)
    if (sessionId && idemKey) {
      const k = `${sessionId}:${idemKey}`
      const cached = idem.get(k)
      if (cached && cached.expires > Date.now()) {
        return NextResponse.json(cached.body)
      }
    }

    if (!url && !text) {
      return NextResponse.json({ ok: false, error: 'Provide url or text' }, { status: 400 })
    }

    let analysis: any = null
    if (url) {
      const urls = Array.isArray(url) ? url : [String(url)]
      const results = await URLContextService.analyzeMultipleURLs(urls)
      analysis = results?.[0] || null
    } else if (text) {
      const content = String(text)
      analysis = {
        url: null,
        title: 'Provided Text',
        description: content.slice(0, 160),
        wordCount: content.trim().split(/\s+/).length,
        readingTime: Math.max(1, Math.ceil(content.length / 900)),
        extractedText: content.slice(0, 4000),
        metadata: {},
      }
    }

    const response = { ok: true, output: analysis }

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'urlContext', { source: url ? 'url' : 'text', size: analysis?.wordCount || 0 }) } catch {}
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


