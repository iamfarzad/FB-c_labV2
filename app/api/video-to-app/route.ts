import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createHash } from "crypto"
import { createOptimizedConfig } from "@/lib/gemini-config-enhanced"
import { isMockEnabled } from "@/lib/mock-control"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"
import { getYouTubeVideoId } from "@/lib/youtube"
import { getYouTubeTranscript, summarizeTranscript, extractKeyTopics } from "@/lib/youtube-transcript"
import { selectModelForFeature, estimateTokens } from "@/lib/model-selector"
import { getSupabase } from "@/lib/supabase/server"
import { enforceBudgetAndLog } from "@/lib/token-usage-logger"
import { withFullSecurity } from "@/lib/api-security"
import { recordCapabilityUsed } from "@/lib/context/capabilities"


// Timeout wrapper for production stability
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ])
}
async function generateText(options: {
  modelName: string
  prompt: string
  videoUrl?: string
  temperature?: number
  correlationId?: string
}): Promise<string> {
  const { modelName, prompt, videoUrl, temperature = 0.75, correlationId } = options

  if (!process.env.GEMINI_API_KEY || isMockEnabled()) {
    // Mock fallback so UI can function without budget/keys
    const isSpec = options.prompt.includes("pedagogist and product designer")
    if (isSpec) {
      return JSON.stringify({
        spec: `{
  "title": "Interactive Learning App (Mock)",
  "modules": [
    { "title": "Key Ideas", "steps": ["Concept 1", "Concept 2"] },
    { "title": "Practice", "steps": ["Quiz", "Flashcards"] }
  ],
  "cta": "Try the quiz and review answers"
}`
      })
    }
    return `<!doctype html><html><head><meta charset="utf-8"/><title>Video App (Mock)</title><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body style="font-family:system-ui;padding:20px"><h1>Interactive Learning App (Mock)</h1><p>This is a mock app generated without an API key.</p><ul><li>Module: Key Ideas</li><li>Practice: Quiz</li></ul><button onclick="alert('Mock quiz complete')">Start Quiz</button></body></html>`
  }

  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  })

  // Use optimized configuration with token limits for video processing
  const config = createOptimizedConfig('research', {
    maxOutputTokens: 4096, // Higher limit for complex video-to-app generation
    temperature: 0.5, // Balanced creativity for app generation
  });

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
          console.info(`📺 Extracting transcript for video:`, { videoUrl, correlationId })
          
          const transcriptData = await getYouTubeTranscript(videoUrl)
          const summarizedTranscript = summarizeTranscript(transcriptData.transcript, 3000)
          const keyTopics = extractKeyTopics(transcriptData.transcript)
          
          console.info(`✅ Transcript extracted:`, { 
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

export const POST = withFullSecurity(async function POST(request: NextRequest) {
  const startTime = Date.now()
  const correlationId = Math.random().toString(36).substring(7)
  
  try {
    // Extract session and user info
    const sessionId = request.headers.get('x-intelligence-session-id') || undefined
    const userId = request.headers.get('authorization')?.replace('Bearer ', '') || undefined
    
  const { action, videoUrl, spec, userPrompt } = await request.json()

    console.info(`🎬 Video-to-App API called:`, {
      action,
      videoUrl: videoUrl ? `${videoUrl.substring(0, 50)}...` : 'none',
      sessionId,
      correlationId
    })

    if (action === "generateSpec") {
      if (!videoUrl) throw new Error('Video URL required for spec')
      
      // Cache key based on videoId + userPrompt
      const videoIdForHash = getYouTubeVideoId(videoUrl) || videoUrl
      const hash = createHash('sha256').update(`${videoIdForHash}|${(userPrompt || '').trim()}`).digest('hex')
      try {
        const supabase = getSupabase()
        const { data: cached } = await supabase
          .from('artifacts')
          .select('*')
          .eq('type', 'video_app_spec')
          .eq('metadata->>hash', hash)
          .limit(1)
          .maybeSingle()
        if (cached?.content) {
          return NextResponse.json({ 
            spec: cached.content,
            model: 'cache',
            estimatedCost: 0,
            cache: true
          })
        }
      } catch {}

      // Estimate tokens and select model
      const estimatedTokens = estimateTokens(SPEC_FROM_VIDEO_PROMPT + videoUrl)
      const modelSelection = selectModelForFeature('video_to_app', estimatedTokens, !!sessionId)
      
      console.info(`📊 Model selection:`, {
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
        console.info(`🚫 Budget exceeded:`, { reason: budgetResult.reason, correlationId })
        return NextResponse.json({ 
          error: 'Budget exceeded', 
          details: budgetResult.reason 
        }, { status: 429 })
      }
      
      console.info(`🚀 Starting spec generation:`, { correlationId })
      
      // Use selected model for video analysis
      const userIntent = (userPrompt && typeof userPrompt === 'string' && userPrompt.trim().length)
        ? `\n\nUSER INTENT:\n${userPrompt.trim()}\n\nIncorporate the user's intent and preferences above when designing the app.`
        : ''

      const specResponse = await generateText({
        modelName: modelSelection.model,
        prompt: SPEC_FROM_VIDEO_PROMPT + userIntent,
        videoUrl: videoUrl,
        correlationId,
      })

      console.info(`✅ Spec generation completed:`, { 
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

      // Store spec in cache
      try {
        const supabase = getSupabase()
        await supabase
          .from('artifacts')
          .insert([{ type: 'video_app_spec', content: parsedSpec, metadata: { hash, videoId: videoIdForHash, intent: (userPrompt || '').trim() } }])
      } catch {}

      console.info(`📋 Spec processing completed:`, { 
        finalLength: parsedSpec.length,
        responseTime: Date.now() - startTime,
        correlationId 
      })

      const resBody = { 
        spec: parsedSpec,
        model: modelSelection.model,
        estimatedCost: modelSelection.estimatedCost
      }
      if (sessionId) {
        try { await recordCapabilityUsed(String(sessionId), 'video2app', { action: 'spec', hasTranscript: true }) } catch {}
      }
      return NextResponse.json(resBody)
    } else if (action === "generateCode") {
      if (!spec) throw new Error('Spec required for code generation')
      
      // Compute cache key if spec includes our addendum and possibly include a hash fallback
      let videoIdForHash = ''
      const intentForHash = ''
      try {
        // Attempt to extract from previous metadata if provided in body later
        const maybeVideoMatch = spec.match(/Video URL:\s*(.*)/i)
        if (maybeVideoMatch && maybeVideoMatch[1]) {
          videoIdForHash = getYouTubeVideoId(maybeVideoMatch[1].trim()) || maybeVideoMatch[1].trim()
        }
      } catch {}
      const hash = createHash('sha256').update(`${videoIdForHash}|${intentForHash}`).digest('hex')
      try {
        const supabase = getSupabase()
        const { data: cached } = await supabase
          .from('artifacts')
          .select('*')
          .eq('type', 'video_app_code')
          .eq('metadata->>hash', hash)
          .limit(1)
          .maybeSingle()
        if (cached?.content && cached?.id) {
          return NextResponse.json({ 
            code: cached.content,
            model: 'cache',
            estimatedCost: 0,
            cache: true,
            artifactId: cached.id
          })
        }
      } catch {}

      // Estimate tokens and select model
      const estimatedTokens = estimateTokens(spec)
      const modelSelection = selectModelForFeature('video_to_app', estimatedTokens, !!sessionId)
      
      console.info(`📊 Code generation model selection:`, {
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
        console.info(`🚫 Budget exceeded for code generation:`, { reason: budgetResult.reason, correlationId })
        return NextResponse.json({ 
          error: 'Budget exceeded', 
          details: budgetResult.reason 
        }, { status: 429 })
      }
      
      console.info(`🚀 Starting code generation:`, { correlationId })
      
      // Use selected model for code generation
      const codeResponse = await generateText({
        modelName: modelSelection.model,
        prompt: spec,
      })

      console.info(`✅ Code generation completed:`, { 
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
      
      // Persist artifact (HTML) for return link reuse
      let artifactId: string | undefined
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('artifacts')
          .insert([{ type: 'video_app_code', content: code, metadata: { model: modelSelection.model, hash } }])
          .select()
          .single()
        if (!error && data?.id) {
          console.info('📝 Stored artifact', data.id)
          artifactId = data.id
        }
      } catch (e) {
        console.warn('Artifact storage failed or unavailable')
      }

      console.info(`💻 Code processing completed:`, { 
        finalLength: code.length,
        responseTime: Date.now() - startTime,
        correlationId 
      })
      
      const resBody2 = { 
        code,
        model: modelSelection.model,
        estimatedCost: modelSelection.estimatedCost,
        artifactId
      }
      if (sessionId) {
        try { await recordCapabilityUsed(String(sessionId), 'video2app', { action: 'code', artifactId }) } catch {}
      }
      return NextResponse.json(resBody2)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Video to App API error:", error)
    return NextResponse.json({ 
      error: "Failed to process request", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
})
