import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"

// LOGIC: Centralized text generation function
// WHY: Reusable logic for different generation types (spec vs code)
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
      temperature, // Higher creativity for educational content
      topP: 0.8,
      topK: 40,
    },
  })

  try {
    // LOGIC: Different handling for spec vs code generation
    // WHY: Spec generation needs multimodal support, code generation is text-only
    if (prompt.includes("pedagogist and product designer")) {
      // LOGIC: Multimodal spec generation from video
      // WHY: Video analysis requires multimodal model capabilities
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
      // LOGIC: Standard text generation for code
      // WHY: Code generation is text-to-text transformation
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
      // LOGIC: Two-phase generation process
      // PHASE 1: Generate educational specification from video
      // WHY: Break down complex video-to-app process into manageable steps
      const specResponse = await generateText({
        modelName: "gemini-2.5-flash", // Multimodal support for video analysis
        prompt: SPEC_FROM_VIDEO_PROMPT,
        videoUrl: videoUrl,
      })

      // LOGIC: Parse and enhance specification
      // WHY: Extract structured data and add educational enhancements
      let parsedSpec = parseJSON(specResponse).spec
      parsedSpec += SPEC_ADDENDUM

      return NextResponse.json({ spec: parsedSpec })
    } else if (action === "generateCode") {
      // PHASE 2: Generate interactive code from specification
      // WHY: Transform educational spec into working interactive application
      const codeResponse = await generateText({
        modelName: "gemini-2.5-flash",
        prompt: spec,
      })

      // LOGIC: Extract code from AI response
      // WHY: AI responses contain explanatory text, need to extract just the code
      const code = parseHTML(codeResponse, CODE_REGION_OPENER, CODE_REGION_CLOSER)
      return NextResponse.json({ code })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Video to App API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
