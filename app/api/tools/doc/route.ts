import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { GoogleGenAI } from '@google/genai'
import { isMockEnabled } from '@/lib/mock-control'
import { createOptimizedConfig } from '@/lib/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens } from '@/lib/model-selector'
import { enforceBudgetAndLog } from '@/lib/token-usage-logger'
import { checkDemoAccess, DemoFeature } from '@/lib/demo-budget-manager'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

type SupportedDocType = 'application/pdf' | 'text/plain' | 'application/json' | 'text/csv' | 'application/xml'

function guessMimeFromName(name?: string): SupportedDocType | undefined {
  if (!name) return undefined
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'txt') return 'text/plain'
  if (ext === 'json') return 'application/json'
  if (ext === 'csv') return 'text/csv'
  if (ext === 'xml') return 'application/xml'
  return undefined
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const { filename, dataUrl, type, analysisType } = body || {}
    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    let mimeType: SupportedDocType | undefined = (type as SupportedDocType) || guessMimeFromName(filename)
    let base64Data = ''

    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      // Client provided base64
      const commaIdx = dataUrl.indexOf(',')
      const header = dataUrl.substring(5, commaIdx)
      mimeType = (header.split(';')[0] as SupportedDocType) || mimeType
      base64Data = dataUrl.substring(commaIdx + 1)
    } else if (typeof filename === 'string' && filename.length) {
      // Read from uploads directory
      const filepath = join(process.cwd(), 'public', 'uploads', filename)
      const buffer = await readFile(filepath)
      base64Data = buffer.toString('base64')
      mimeType = (mimeType || guessMimeFromName(filename)) as SupportedDocType
    }

    if (!base64Data || !mimeType) {
      return NextResponse.json({ ok: false, error: 'No document provided or unsupported type' }, { status: 400 })
    }

    // Mock or no key → return structured mock-ish analysis
    if (!process.env.GEMINI_API_KEY || isMockEnabled()) {
      const mock = {
        summary: 'Document analyzed (mock). Provides a business summary and key points.',
        keyPoints: ['Key point A', 'Key point B', 'Key point C'],
        type: mimeType,
        bytes: Math.ceil((base64Data.length * 3) / 4),
      }
      if (sessionId) {
        try { await recordCapabilityUsed(String(sessionId), 'doc', { mode: 'mock', type: mimeType }) } catch {}
      }
      return NextResponse.json({ ok: true, output: { analysis: mock, processedAt: new Date().toISOString(), mock: true } })
    }

    // Budget and access checks
    const estimatedTokens = estimateTokens('document analysis') + 2500
    const modelSelection = selectModelForFeature('document_analysis', estimatedTokens, !!sessionId)

    if (sessionId && process.env.NODE_ENV !== 'test') {
      const accessCheck = await checkDemoAccess(sessionId, 'document_analysis' as DemoFeature, estimatedTokens)
      if (!accessCheck.allowed) return NextResponse.json({ ok: false, error: 'Demo limit reached' }, { status: 429 })
    }

    if (userId && process.env.NODE_ENV !== 'test') {
      const budgetCheck = await enforceBudgetAndLog(userId, sessionId, 'document_analysis', modelSelection.model, estimatedTokens, estimatedTokens * 0.5, true)
      if (!budgetCheck.allowed) return NextResponse.json({ ok: false, error: 'Budget limit reached' }, { status: 429 })
    }

    // Generate with Gemini
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const optimizedConfig = createOptimizedConfig('analysis', { maxOutputTokens: 1536, temperature: 0.3, topP: 0.8, topK: 40 })
    let analysisText = ''
    try {
      const result = await genAI.models.generateContent({
        model: modelSelection.model,
        config: optimizedConfig,
        contents: [{
          role: 'user',
          parts: [
            { text: `Analyze this ${mimeType} and provide a concise summary, key points, risks, opportunities, and actionable recommendations. ${analysisType ? `Focus on ${analysisType}.` : ''}` },
            { inlineData: { mimeType, data: base64Data } }
          ]
        }]
      })
      analysisText = result.candidates?.[0]?.content?.parts?.map(p => (p as any).text).filter(Boolean).join(' ') || result.candidates?.[0]?.content?.parts?.[0]?.text || 'Analysis completed'
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'AI analysis failed' }, { status: 500 })
    }

    const response = { ok: true, output: {
      analysis: analysisText,
      type: mimeType,
      processedAt: new Date().toISOString()
    }}
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'doc', { type: mimeType }) } catch {}
    }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error && (error as any).name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}


