import { GoogleGenAI } from '@google/genai'
import type { NextRequest } from 'next/server'
import { recordCapabilityUsed } from '@/lib/context/capabilities'
import { translationRequestSchema, validateRequest, sanitizeString } from '@/lib/validation'
import { logServerActivity } from '@/lib/server-activity-logger'
import type { ToolRunResult } from '@/types/intelligence'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const correlationId = Math.random().toString(36).substring(7)
  try {
    const body = await req.json()
    const validation = validateRequest(translationRequestSchema, body)
    if (!validation.success) {
      return new Response(JSON.stringify({ ok: false, error: 'Validation failed', details: validation.errors } satisfies ToolRunResult), { status: 400 })
    }

    const { text, targetLang, sourceLang, sessionId: bodySessionId } = validation.data as any
    const cleanText = sanitizeString(text)
    const sessionId = bodySessionId || req.headers.get('x-intelligence-session-id') || null

    if (!process.env.GEMINI_API_KEY || process.env.ENABLE_GEMINI_MOCKING === 'true') {
      const mocked = `[mock-${targetLang}] ${cleanText}`
      if (sessionId) {
        try { await recordCapabilityUsed(String(sessionId), 'translate', { targetLang, sourceLang, inputLength: cleanText.length, outputLength: mocked.length, mocked: true }) } catch {}
      }
      await logServerActivity({
        type: 'ai_stream',
        title: 'Translate Completed (mock)',
        description: `Translated to ${targetLang}`,
        status: 'completed',
        metadata: { correlationId, ms: Date.now() - startTime }
      })
      return new Response(JSON.stringify({ ok: true, output: { translated: mocked } } satisfies ToolRunResult), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    await logServerActivity({
      type: 'ai_thinking',
      title: 'Translate Request',
      description: `to ${targetLang}${sourceLang ? ` from ${sourceLang}` : ''}`,
      status: 'in_progress',
      metadata: { correlationId, length: cleanText.length }
    })

    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const model = client.models.generateContent

    const prompt = `Translate the following text${sourceLang ? ` from ${sourceLang}` : ''} into ${targetLang}.
Preserve meaning, tone, and formatting. Return only the translated text, no preface.

Text:
"""
${cleanText}
"""`

    const result = await model({
      model: 'gemini-2.0-flash',
      contents: [ { role: 'user', parts: [{ text: prompt }] } ],
      config: { maxOutputTokens: Math.min(4096, Math.ceil(cleanText.length * 1.2)) }
    })

    const translated = result.response?.text() ?? ''

    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'translate', { targetLang, sourceLang, inputLength: cleanText.length, outputLength: translated.length }) } catch {}
    }

    await logServerActivity({
      type: 'ai_stream',
      title: 'Translate Completed',
      description: `Translated to ${targetLang}`,
      status: 'completed',
      metadata: { correlationId, ms: Date.now() - startTime }
    })

    return new Response(JSON.stringify({ ok: true, output: { translated } } satisfies ToolRunResult), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error: any) {
    await logServerActivity({
      type: 'error',
      title: 'Translate Failed',
      description: error.message || 'Unknown error',
      status: 'failed',
      metadata: { correlationId }
    })
    return new Response(JSON.stringify({ ok: false, error: 'Internal error', details: error.message || 'Unknown error' } satisfies ToolRunResult), { status: 500 })
  }
}


