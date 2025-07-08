import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"

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

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature,
      topP: 0.8,
      topK: 40,
    },
  })

  try {
    if (prompt.includes("pedagogist and product designer")) {
      // This is a spec generation request - use multimodal model
      const result = await model.generateContent([
        {
          text: prompt,
        },
        // Add video URL context if provided
        ...(videoUrl ? [{ text: `Video URL: ${videoUrl}` }] : []),
      ])

      const response = await result.response
      return response.text()
    } else {
      // This is a code generation request
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
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
      // Use multimodal model for video analysis
      const specResponse = await generateText({
        modelName: "gemini-2.5-flash", // Supports video, audio, image, text
        prompt: SPEC_FROM_VIDEO_PROMPT,
        videoUrl: videoUrl,
      })

      let parsedSpec = parseJSON(specResponse).spec
      parsedSpec += SPEC_ADDENDUM

      return NextResponse.json({ spec: parsedSpec })
    } else if (action === "generateCode") {
      // Use standard model for code generation
      const codeResponse = await generateText({
        modelName: "gemini-2.5-flash",
        prompt: spec,
      })

      const code = parseHTML(codeResponse, CODE_REGION_OPENER, CODE_REGION_CLOSER)
      return NextResponse.json({ code })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Video to App API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
