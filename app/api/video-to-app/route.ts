import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"
import { getYouTubeVideoId } from "@/lib/youtube"
import { selectModelForFeature, estimateTokens } from "@/lib/model-selector"
import { enforceBudgetAndLog } from "@/lib/token-usage-logger"
import { checkDemoAccess, recordDemoUsage } from "@/lib/demo-budget-manager"

async function generateText(options: {
  modelName: string
  prompt: string
  videoUrl?: string
  temperature?: number
}): Promise<string> {
  const { modelName, prompt, videoUrl, temperature = 0.75 } = options

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  })

  const config = {
    responseMimeType: "text/plain",
  }

  try {
    if (prompt.includes("pedagogist and product designer")) {
      // This is a spec generation request - use multimodal model
      let contents = [
        { role: "user", parts: [{ text: prompt }] },
      ]

      if (videoUrl) {
        // For YouTube URLs, we'll use the URL directly since Gemini can access web content
        const videoId = getYouTubeVideoId(videoUrl)
        if (videoId) {
          // Use the video URL directly - Gemini can access YouTube content
          contents = [
            { 
              role: "user", 
              parts: [
                { text: prompt },
                { text: `Video URL: ${videoUrl}` }
              ] 
            },
          ]
        }
      }

      const result = await genAI.models.generateContent({
        model: modelName,
        config,
        contents,
      })

      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Spec generation failed'
    } else {
      // This is a code generation request
      const result = await genAI.models.generateContent({
        model: modelName,
        config,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      })

      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Code generation failed'
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error(`Failed to generate content: ${error}`)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const correlationId = Math.random().toString(36).substring(7)
  
  try {
    // Extract session and user info
    const sessionId = request.headers.get('x-demo-session-id') || undefined
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || undefined
    
    const { action, videoUrl, spec } = await request.json()

    if (action === "generateSpec") {
      if (!videoUrl) throw new Error('Video URL required for spec')
      
      // Estimate tokens and select model
      const estimatedTokens = estimateTokens(SPEC_FROM_VIDEO_PROMPT + videoUrl)
      const modelSelection = selectModelForFeature('video_to_app', estimatedTokens, !!sessionId)
      
      // Check demo access and budget
      const demoAccess = await checkDemoAccess(sessionId || '', 'video_to_app', estimatedTokens)
      if (!demoAccess.allowed) {
        return NextResponse.json({ 
          error: 'Demo budget exceeded', 
          details: demoAccess.reason 
        }, { status: 429 })
      }
      
      // Enforce budget and log usage
      const budgetResult = await enforceBudgetAndLog(
        userId,
        sessionId,
        'video_to_app',
        modelSelection.model,
        estimatedTokens,
        estimatedTokens * 0.8, // Estimate output tokens
        true,
        undefined,
        { action: 'generateSpec', videoUrl }
      )
      
      if (!budgetResult.allowed) {
        return NextResponse.json({ 
          error: 'Budget exceeded', 
          details: budgetResult.reason 
        }, { status: 429 })
      }
      
      // Use selected model for video analysis
      const specResponse = await generateText({
        modelName: modelSelection.model,
        prompt: SPEC_FROM_VIDEO_PROMPT,
        videoUrl: videoUrl,
      })

      // Record demo usage
      await recordDemoUsage(sessionId || '', 'video_to_app', estimatedTokens)

      let parsedSpec
      try {
        const parsed = parseJSON(specResponse)
        parsedSpec = parsed.spec
      } catch (parseError) {
        console.error("Failed to parse spec JSON:", parseError)
        // Fallback: try to extract spec from the response
        parsedSpec = specResponse
      }
      
      parsedSpec += SPEC_ADDENDUM

      return NextResponse.json({ 
        spec: parsedSpec,
        model: modelSelection.model,
        estimatedCost: modelSelection.estimatedCost
      })
    } else if (action === "generateCode") {
      if (!spec) throw new Error('Spec required for code generation')
      
      // Estimate tokens and select model
      const estimatedTokens = estimateTokens(spec)
      const modelSelection = selectModelForFeature('video_to_app', estimatedTokens, !!sessionId)
      
      // Check demo access and budget
      const demoAccess = await checkDemoAccess(sessionId || '', 'video_to_app', estimatedTokens)
      if (!demoAccess.allowed) {
        return NextResponse.json({ 
          error: 'Demo budget exceeded', 
          details: demoAccess.reason 
        }, { status: 429 })
      }
      
      // Enforce budget and log usage
      const budgetResult = await enforceBudgetAndLog(
        userId,
        sessionId,
        'video_to_app',
        modelSelection.model,
        estimatedTokens,
        estimatedTokens * 0.8, // Estimate output tokens
        true,
        undefined,
        { action: 'generateCode' }
      )
      
      if (!budgetResult.allowed) {
        return NextResponse.json({ 
          error: 'Budget exceeded', 
          details: budgetResult.reason 
        }, { status: 429 })
      }
      
      // Use selected model for code generation
      const codeResponse = await generateText({
        modelName: modelSelection.model,
        prompt: spec,
      })

      // Record demo usage
      await recordDemoUsage(sessionId || '', 'video_to_app', estimatedTokens)

      let code
      try {
        code = parseHTML(codeResponse, CODE_REGION_OPENER, CODE_REGION_CLOSER)
      } catch (parseError) {
        console.error("Failed to parse HTML code:", parseError)
        // Fallback: return the raw response
        code = codeResponse
      }
      
      return NextResponse.json({ 
        code,
        model: modelSelection.model,
        estimatedCost: modelSelection.estimatedCost
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Video to App API error:", error)
    return NextResponse.json({ 
      error: "Failed to process request", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
