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
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000)
    })

    if (prompt.includes("pedagogist and product designer")) {
      // This is a spec generation request - use multimodal model
      let contents = [
        { role: "user", parts: [{ text: prompt }] },
      ]

      if (videoUrl) {
        // For YouTube URLs, we'll enhance the prompt with video context
        const videoId = getYouTubeVideoId(videoUrl)
        if (videoId) {
          // Enhanced prompt that includes video URL context
          const enhancedPrompt = `${prompt}\n\nVideo URL: ${videoUrl}\nVideo ID: ${videoId}\n\nPlease analyze this YouTube video and create a comprehensive spec for an interactive learning app based on its content. If you cannot access the video directly, please create a spec for a general educational app that could complement video-based learning.`
          
          contents = [
            { 
              role: "user", 
              parts: [{ text: enhancedPrompt }]
            },
          ]
        }
      }

      // Race between the API call and timeout
      const result = await Promise.race([
        genAI.models.generateContent({
          model: modelName,
          config,
          contents,
        }),
        timeoutPromise
      ])

      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Spec generation failed'
    } else {
      // This is a code generation request
      const result = await Promise.race([
        genAI.models.generateContent({
          model: modelName,
          config,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
        timeoutPromise
      ])

      return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Code generation failed'
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('Request timed out. Please try again with a shorter video or different content.')
    }
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

    console.log(`🎬 Video-to-App API called:`, {
      action,
      videoUrl: videoUrl ? `${videoUrl.substring(0, 50)}...` : 'none',
      sessionId,
      correlationId
    })

    if (action === "generateSpec") {
      if (!videoUrl) throw new Error('Video URL required for spec')
      
      // Estimate tokens and select model
      const estimatedTokens = estimateTokens(SPEC_FROM_VIDEO_PROMPT + videoUrl)
      const modelSelection = selectModelForFeature('video_to_app', estimatedTokens, !!sessionId)
      
      console.log(`📊 Model selection:`, {
        model: modelSelection.model,
        estimatedCost: modelSelection.estimatedCost,
        reason: modelSelection.reason,
        correlationId
      })
      
      // Check demo access and budget
      const demoAccess = await checkDemoAccess(sessionId || '', 'video_to_app', estimatedTokens)
      if (!demoAccess.allowed) {
        console.log(`🚫 Demo access denied:`, { reason: demoAccess.reason, correlationId })
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
        console.log(`🚫 Budget exceeded:`, { reason: budgetResult.reason, correlationId })
        return NextResponse.json({ 
          error: 'Budget exceeded', 
          details: budgetResult.reason 
        }, { status: 429 })
      }
      
      console.log(`🚀 Starting spec generation:`, { correlationId })
      
      // Use selected model for video analysis
      const specResponse = await generateText({
        modelName: modelSelection.model,
        prompt: SPEC_FROM_VIDEO_PROMPT,
        videoUrl: videoUrl,
      })

      console.log(`✅ Spec generation completed:`, { 
        responseLength: specResponse.length,
        correlationId 
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

      console.log(`📋 Spec processing completed:`, { 
        finalLength: parsedSpec.length,
        responseTime: Date.now() - startTime,
        correlationId 
      })

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
      
      console.log(`📊 Code generation model selection:`, {
        model: modelSelection.model,
        estimatedCost: modelSelection.estimatedCost,
        reason: modelSelection.reason,
        correlationId
      })
      
      // Check demo access and budget
      const demoAccess = await checkDemoAccess(sessionId || '', 'video_to_app', estimatedTokens)
      if (!demoAccess.allowed) {
        console.log(`🚫 Demo access denied for code generation:`, { reason: demoAccess.reason, correlationId })
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
        console.log(`🚫 Budget exceeded for code generation:`, { reason: budgetResult.reason, correlationId })
        return NextResponse.json({ 
          error: 'Budget exceeded', 
          details: budgetResult.reason 
        }, { status: 429 })
      }
      
      console.log(`🚀 Starting code generation:`, { correlationId })
      
      // Use selected model for code generation
      const codeResponse = await generateText({
        modelName: modelSelection.model,
        prompt: spec,
      })

      console.log(`✅ Code generation completed:`, { 
        responseLength: codeResponse.length,
        correlationId 
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
      
      console.log(`💻 Code processing completed:`, { 
        finalLength: code.length,
        responseTime: Date.now() - startTime,
        correlationId 
      })
      
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
