import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { imageData, prompt = "Analyze this image and provide detailed insights." } = await req.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ])

    const response = await result.response
    const analysis = response.text()

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Image analysis error:", error)
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 })
  }
}
