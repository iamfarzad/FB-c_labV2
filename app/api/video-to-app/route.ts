import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { parseJSON, parseHTML } from "@/lib/parse-utils"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/ai-prompts"

// Placeholder for a real video transcription service
async function transcribeVideo(videoUrl: string): Promise<string> {
  console.log(`Simulating transcription for: ${videoUrl}`)
  // In a real app, you would use a service to get the video's transcript.
  // For this example, we'll return a mock transcript based on a known video.
  if (videoUrl.includes("functional-harmony")) {
    return "This video explains the concept of functional harmony in music theory. It covers the 7 diatonic triads like the tonic, dominant, and subdominant. It describes how chords create tension and resolution, and how they tend to move towards other specific chords to create a sense of progression."
  }
  return "This is a placeholder transcript for the video. The content discusses key ideas and concepts shown in the video, which will be used to generate an interactive learning application."
}

// LOGIC: Centralized text generation function
// WHY: Reusable logic for different generation types (spec vs code)
async function generateText(options: {
  modelName: string
  prompt: string
  temperature?: number
}): Promise<string> {
  const { modelName, prompt, temperature = 0.75 } = options

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
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
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
      // PHASE 1: Generate educational specification from video transcript
      // WHY: Break down complex video-to-app process into manageable steps

      // First, get the video's transcript
      const transcript = await transcribeVideo(videoUrl)

      // Now, generate the spec from the transcript text
      const specResponse = await generateText({
        modelName: "gemini-1.5-flash",
        prompt: `${SPEC_FROM_VIDEO_PROMPT}\n\nHere is the video transcript to analyze:\n\n${transcript}`,
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
