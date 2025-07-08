import { GoogleGenerativeAI } from "@google/generative-ai"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, enableAudio = false, enableTTS = false, voiceStyle = "neutral" } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    if (enableTTS) {
      // Use TTS-specific model for audio generation
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-preview-tts",
        generationConfig: {
          temperature: 0.7,
        },
      })

      const result = await model.generateContent(prompt)
      const response = await result.response

      // In a real implementation, this would return audio data
      return NextResponse.json({
        success: true,
        content: response.text(),
        audioSupported: true,
        audioData: null, // Would contain base64 audio data
        voiceStyle: voiceStyle,
      })
    } else if (enableAudio) {
      // Use Live API model for interactive voice
      const model = genAI.getGenerativeModel({
        model: "gemini-live-2.5-flash-preview",
        generationConfig: {
          temperature: 0.7,
        },
      })

      // For now, return a placeholder for Live API setup
      // In production, this would establish a WebSocket connection
      return NextResponse.json({
        success: true,
        message: "Live audio session ready - WebSocket connection would be established",
        audioSupported: true,
        liveApiReady: true,
      })
    } else {
      // Standard text generation with multimodal support
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.7,
        },
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return NextResponse.json({
        success: true,
        content: text,
        audioSupported: false,
      })
    }
  } catch (error: any) {
    console.error("Gemini Live API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
