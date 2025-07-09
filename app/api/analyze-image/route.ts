import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { image, type } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured")
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt =
      type === "webcam"
        ? "Analyze this webcam image. Describe what you see, including people, objects, activities, and the environment. Be specific and helpful."
        : "Analyze this screen capture. Describe what application or content is being shown, what the user might be working on, and any notable elements or activities visible."

    // Convert base64 image to the format Gemini expects
    const base64Data = image.includes(",") ? image.split(",")[1] : image
    const mimeType = image.includes("data:") ? image.split(";")[0].split(":")[1] : "image/jpeg"

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ])

    const response = await result.response
    const analysis = response.text()

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Image analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
