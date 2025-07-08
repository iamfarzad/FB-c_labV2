import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, conversationHistory = [], leadContext, sessionId } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    })

    // Build system prompt with lead context
    let systemPrompt = `You are F.B/c AI Assistant, an expert in AI automation and business consulting.`

    if (leadContext?.name) {
      systemPrompt += ` The user's name is ${leadContext.name}.`
    }
    if (leadContext?.company) {
      systemPrompt += ` They work at ${leadContext.company}.`
    }
    if (leadContext?.role) {
      systemPrompt += ` Their role is ${leadContext.role}.`
    }
    if (leadContext?.interests) {
      systemPrompt += ` They're interested in: ${leadContext.interests}.`
    }

    systemPrompt += `\n\nProvide helpful, personalized responses about AI automation, business processes, and technology solutions. Be conversational, professional, and focus on practical business value.`

    // Prepare conversation for Gemini
    const messages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content || msg.parts?.[0]?.text || "" }],
      })),
      { role: "user", parts: [{ text: prompt }] },
    ]

    // Generate response
    const chat = model.startChat({
      history: messages.slice(0, -1), // All messages except the last one
    })

    const result = await chat.sendMessage(prompt)
    const response = await result.response
    const text = response.text()

    // Create response message
    const aiMessage = {
      id: `ai_${Date.now()}`,
      role: "assistant",
      content: text,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      message: aiMessage,
      success: true,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        return NextResponse.json({ error: "API quota exceeded. Please try again later." }, { status: 429 })
      }
      if (error.message.includes("authentication")) {
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
      }
    }

    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
