import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"
import { getYouTubeVideoId } from "@/lib/youtube"
import { getYouTubeTranscript, summarizeTranscript, extractKeyTopics } from "@/lib/youtube-transcript"
import { selectModelForFeature, estimateTokens } from "@/lib/model-selector"
import { enforceBudgetAndLog } from "@/lib/token-usage-logger"

async function generateText(options: {
  modelName: string
  prompt: string
  videoUrl?: string
  temperature?: number
  correlationId?: string
}): Promise<string> {
  const { modelName, prompt, videoUrl, temperature = 0.75, correlationId } = options

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
        // Extract transcript from YouTube video
        try {
          console.log(`📺 Extracting transcript for video:`, { videoUrl, correlationId })
          
          const transcriptData = await getYouTubeTranscript(videoUrl)
          const summarizedTranscript = summarizeTranscript(transcriptData.transcript, 3000)
          const keyTopics = extractKeyTopics(transcriptData.transcript)
          
          console.log(`✅ Transcript extracted:`, { 
            transcriptLength: transcriptData.transcript.length,
            summarizedLength: summarizedTranscript.length,
            keyTopics: keyTopics.slice(0, 5),
            videoTitle: transcriptData.title,
            correlationId 
          })
          
          // Enhanced prompt with actual video content
          const enhancedPrompt = `${prompt}

VIDEO CONTENT ANALYSIS:
Title: ${transcriptData.title || 'Unknown'}
Video URL: ${videoUrl}

TRANSCRIPT:
${summarizedTranscript}

KEY TOPICS IDENTIFIED:
${keyTopics.slice(0, 8).join(', ')}

Based on this video content, create a comprehensive spec for an interactive learning app that reinforces the key concepts and ideas presented in the video. The app should be educational, engaging, and directly related to the video's content.`
          
          contents = [
            { 
              role: "user", 
              parts: [{ text: enhancedPrompt }]
            },
          ]
        } catch (transcriptError) {
          console.warn(`⚠️ Failed to extract transcript:`, { 
            error: transcriptError instanceof Error ? transcriptError.message : 'Unknown error',
            correlationId 
          })
          
          // Fallback: Use basic video info
          const videoId = getYouTubeVideoId(videoUrl)
          const fallbackPrompt = `${prompt}\n\nVideo URL: ${videoUrl}\nVideo ID: ${videoId}\n\nNote: Could not extract video transcript (${transcriptError instanceof Error ? transcriptError.message : 'transcript unavailable'}). Please create a general interactive learning app spec that could complement educational video content. Focus on common educational patterns and interactive elements that enhance video-based learning.`
          
          contents = [
            { 
              role: "user", 
              parts: [{ text: fallbackPrompt }]
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
      
      // Demo access is now handled client-side with simplified session system
      
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
        correlationId,
      })

      console.log(`✅ Spec generation completed:`, { 
        responseLength: specResponse.length,
        correlationId 
      })

      // Usage tracking is now handled client-side with simplified demo session system

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
      
      // Demo access is now handled client-side with simplified session system
      
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

      // Usage tracking is now handled client-side with simplified demo session system

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
