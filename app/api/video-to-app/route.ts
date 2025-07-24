import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"
import { getYouTubeVideoId } from "@/lib/youtube"

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
  try {
    const { action, videoUrl, spec } = await request.json()

    if (action === "generateSpec") {
      if (!videoUrl) throw new Error('Video URL required for spec')
      
      // Use multimodal model for video analysis
      const specResponse = await generateText({
        modelName: "gemini-2.5-flash", // Supports video, audio, image, text
        prompt: SPEC_FROM_VIDEO_PROMPT,
        videoUrl: videoUrl,
      })

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

      return NextResponse.json({ spec: parsedSpec })
    } else if (action === "generateCode") {
      if (!spec) throw new Error('Spec required for code generation')
      
      // Use standard model for code generation
      const codeResponse = await generateText({
        modelName: "gemini-2.5-flash",
        prompt: spec,
      })

      let code
      try {
        code = parseHTML(codeResponse, CODE_REGION_OPENER, CODE_REGION_CLOSER)
      } catch (parseError) {
        console.error("Failed to parse HTML code:", parseError)
        // Fallback: return the raw response
        code = codeResponse
      }
      
      return NextResponse.json({ code })
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
