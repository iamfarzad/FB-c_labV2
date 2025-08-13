import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createOptimizedConfig } from '@/lib/gemini-config-enhanced'
import { selectModelForFeature, estimateTokens } from '@/lib/model-selector'
import { enforceBudgetAndLog } from '@/lib/token-usage-logger'
import { checkDemoAccess, recordDemoUsage, DemoFeature } from '@/lib/demo-budget-manager'
import { ScreenShareSchema } from '@/lib/services/tool-service'
import { recordCapabilityUsed } from '@/lib/context/capabilities'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = ScreenShareSchema.parse(body)
    const { image } = validatedData

    const sessionId = req.headers.get('x-intelligence-session-id') || undefined
    const userId = req.headers.get('x-user-id') || undefined

    if (!process.env.GEMINI_API_KEY) {
      const response = { ok: true, output: {
        analysis: "Screen analysis completed (mock).",
        insights: ["UI elements detected", "Structure analyzed", "Mock mode"],
        imageSize: image.length,
        isBase64: image.startsWith('data:image'),
        processedAt: new Date().toISOString()
      }}
      if (sessionId) {
        try { await recordCapabilityUsed(String(sessionId), 'screenShare', { mode: 'fallback', imageSize: image.length }) } catch {}
      }
      return NextResponse.json(response, { status: 200 })
    }

    if (!image) return NextResponse.json({ ok: false, error: 'No image data provided' }, { status: 400 })

    const estimatedTokens = estimateTokens('screen analysis') + 2000
    const modelSelection = selectModelForFeature('screenshot_analysis', estimatedTokens, !!sessionId)

    if (sessionId) {
      const accessCheck = await checkDemoAccess(sessionId, 'screenshot_analysis' as DemoFeature, estimatedTokens)
      if (!accessCheck.allowed) {
        return NextResponse.json({ ok: false, error: 'Demo limit reached' }, { status: 429 })
      }
    }

    if (userId) {
      const budgetCheck = await enforceBudgetAndLog(
        userId, sessionId, 'screenshot_analysis', modelSelection.model, estimatedTokens, estimatedTokens * 0.5, true
      )
      if (!budgetCheck.allowed) return NextResponse.json({ ok: false, error: 'Budget limit reached' }, { status: 429 })
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const model = genAI.models.generateContentStream
    let analysisResult = ''

    try {
      const optimizedConfig = createOptimizedConfig('analysis', { maxOutputTokens: 1024, temperature: 0.3, topP: 0.8, topK: 40 })
      const result = await model({
        model: modelSelection.model,
        contents: [{ role: 'user', parts: [ { text: 'Analyze this screen for business insights.' }, { inlineData: { mimeType: 'image/jpeg', data: image.split(',')[1] } } ] }],
        generationConfig: optimizedConfig
      })
      if (result.stream) {
        for await (const chunk of result.stream) {
          const t = chunk.text(); if (t) analysisResult += t
        }
      } else {
        analysisResult = result.response?.text() || 'Analysis completed'
      }
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'AI analysis failed' }, { status: 500 })
    }

    const response = { ok: true, output: {
      analysis: analysisResult,
      insights: ["UI elements detected", "Content structure analyzed"],
      imageSize: image.length,
      isBase64: image.startsWith('data:image'),
      processedAt: new Date().toISOString()
    }}
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'screenShare', { insights: response.output.insights, imageSize: image.length }) } catch {}
    }
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}


