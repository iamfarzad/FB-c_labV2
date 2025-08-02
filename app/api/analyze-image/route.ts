import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

export async function POST(request: NextRequest) {
  try {
    const { image, type } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured")
    }

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    const prompt =
      type === "webcam"
        ? "Analyze this webcam image. Describe what you see, including people, objects, activities, and the environment. Be specific and helpful."
        : "Analyze this screen capture. Describe what application or content is being shown, what the user might be working on, and any notable elements or activities visible."

    // Convert base64 image to the format Gemini expects
    const base64Data = image.includes(",") ? image.split(",")[1] : image
    const mimeType = image.includes("data:") ? image.split(";")[0].split(":")[1] : "image/jpeg"

    const config = {
      responseMimeType: "text/plain",
    };

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite", // Updated from gemini-1.5-flash for cost efficiency
      config,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            }
          ],
        },
      ],
    })

    const analysis = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available'

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Image analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
