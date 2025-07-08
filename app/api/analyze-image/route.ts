import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { image, prompt = "Analyze this image and provide business insights" } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Convert base64 image to the format Gemini expects
    const imagePart = {
      inlineData: {
        data: image.split(",")[1], // Remove data:image/jpeg;base64, prefix
        mimeType: image.split(";")[0].split(":")[1], // Extract mime type
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const analysis = response.text()

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Image analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze image", details: error.message }, { status: 500 })
  }
}
