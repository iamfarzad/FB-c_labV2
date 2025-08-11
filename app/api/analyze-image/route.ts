
import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createOptimizedConfig } from "@/lib/gemini-config-enhanced"
import { recordCapabilityUsed } from "@/lib/context/capabilities"
import { embedTexts } from "@/lib/embeddings/gemini"
import { upsertEmbeddings } from "@/lib/embeddings/query"
const rl = new Map<string, { count: number; reset: number }>()
const idem = new Map<string, { expires: number; body: any }>()
function checkRate(key: string, max: number, windowMs: number) {
  const now = Date.now(); const rec = rl.get(key)
  if (!rec || rec.reset < now) { rl.set(key, { count: 1, reset: now + windowMs }); return true }
  if (rec.count >= max) return false
  rec.count++; return true
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-correlation-id, x-intelligence-session-id, x-user-id',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { image, type } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured")
    }

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    const prompt =
      type === "webcam"
        ? "Analyze this webcam image. Describe what you see, including people, objects, activities, and the environment. Be specific and helpful."
        : "Analyze this screen capture. Describe what application or content is being shown, what the user might be working on, and any notable elements or activities visible."

    // Convert base64 image to the format Gemini expects
    const base64Data = image.includes(",") ? image.split(",")[1] : image
    const mimeType = image.includes("data:") ? image.split(";")[0].split(":")[1] : "image/jpeg"

    // Use optimized configuration with token limits
    const optimizedConfig = createOptimizedConfig('analysis', {
      maxOutputTokens: 512, // Limit output for image analysis
      temperature: 0.3, // More focused analysis
    });

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite", // Cost-efficient model for analysis
      config: optimizedConfig,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            }
          ],
        },
      ],
    })

    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available'

    const sessionId = request.headers.get('x-intelligence-session-id') || undefined
    const idemKey = request.headers.get('x-idempotency-key') || undefined
    const rlKey = `image:${sessionId || 'anon'}`
    if (!checkRate(rlKey, 10, 60_000)) return NextResponse.json({ error: 'Rate limit exceeded' as any }, { status: 429 })
    if (sessionId && idemKey) {
      const k = `${sessionId}:${idemKey}`
      const cached = idem.get(k)
      if (cached && cached.expires > Date.now()) return NextResponse.json(cached.body)
    }
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'image', { mimeType, size: base64Data.length }) } catch {}
    }

    const body = { analysis }
    if (sessionId && idemKey) idem.set(`${sessionId}:${idemKey}`, { expires: Date.now() + 5 * 60_000, body })
    if (process.env.EMBEDDINGS_ENABLED === 'true' && sessionId) {
      try {
        if (analysis?.trim()) {
          const vecs = await embedTexts([analysis], 1536)
          if (vecs && vecs[0]) await upsertEmbeddings(String(sessionId), 'image', [analysis], vecs)
        }
      } catch {}
    }
    return NextResponse.json(body)
  } catch (error) {
    console.error("Image analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
