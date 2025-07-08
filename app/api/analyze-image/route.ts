import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import { activityLogger } from "@/lib/activity-logger"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { image, type = "general", prompt } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Log the analysis start
    await activityLogger.log({
      type: "vision_analysis",
      title: `${type === "webcam" ? "Webcam" : "Screen"} Analysis Started`,
      description: "Processing image with Gemini Vision",
      status: "in_progress",
    })

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Create appropriate prompt based on type
    let analysisPrompt = prompt
    if (!analysisPrompt) {
      switch (type) {
        case "webcam":
          analysisPrompt =
            "Analyze this webcam image for business insights. Describe what you see, identify any objects, people, or text, and provide actionable business recommendations or opportunities for AI automation."
          break
        case "screen":
          analysisPrompt =
            "Analyze this screenshot for business optimization opportunities. Identify the application, UI elements, workflow patterns, and suggest improvements or automation possibilities using AI."
          break
        default:
          analysisPrompt =
            "Analyze this image and provide detailed business insights, focusing on practical applications and AI automation opportunities."
      }
    }

    // Convert base64 image to the format Gemini expects
    const base64Data = image.includes(",") ? image.split(",")[1] : image
    const mimeType = image.includes("data:") ? image.split(";")[0].split(":")[1] : "image/jpeg"

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    }

    const result = await model.generateContent([analysisPrompt, imagePart])
    const response = await result.response
    const analysis = response.text()

    // Log successful analysis
    await activityLogger.log({
      type: "vision_analysis",
      title: `${type === "webcam" ? "Webcam" : "Screen"} Analysis Complete`,
      description: "Image analyzed successfully with Gemini Vision",
      status: "completed",
      metadata: {
        analysisType: type,
        analysisLength: analysis.length,
      },
    })

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      type,
    })
  } catch (error: any) {
    console.error("Image analysis error:", error)

    // Log the error
    await activityLogger.log({
      type: "error",
      title: "Image Analysis Failed",
      description: error.message || "Failed to analyze image",
      status: "failed",
      metadata: {
        error: error.message,
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze image",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
