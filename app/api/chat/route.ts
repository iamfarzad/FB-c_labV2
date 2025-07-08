import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabase } from "@/lib/supabase/server"
import { calculateTokenCost, logTokenUsage } from "@/lib/token-cost-calculator"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  parts: { text: string }[]
}

interface LeadContext {
  name?: string
  email?: string
  company?: string
  engagementType?: string
  initialQuery?: string
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, conversationHistory = [], leadContext, sessionId } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Initialize Gemini
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

    // Build conversation context
    const systemPrompt = `You are F.B/c AI Assistant, an expert in AI automation and business consulting. 
${leadContext?.name ? `The user's name is ${leadContext.name}.` : ""}
${leadContext?.company ? `They work at ${leadContext.company}.` : ""}
${leadContext?.engagementType ? `They engaged via ${leadContext.engagementType}.` : ""}

Provide helpful, personalized responses about AI automation, business processes, and technology solutions.
Be conversational, professional, and focus on practical business value.`

    // Prepare conversation history (last 5 messages for context)
    const recentHistory = conversationHistory.slice(-5)
    const messages = [
      { role: "system" as const, parts: [{ text: systemPrompt }] },
      ...recentHistory,
      { role: "user" as const, parts: [{ text: prompt }] },
    ]

    // Generate response
    const result = await model.generateContent(
      messages.map((msg) => ({
        role: msg.role === "system" ? "user" : msg.role,
        parts: msg.parts,
      })),
    )

    const response = await result.response
    const aiResponse = response.text()

    // Calculate token usage and cost
    const usage = await result.response.usageMetadata
    const inputTokens = usage?.promptTokenCount || 0
    const outputTokens = usage?.candidatesTokenCount || 0
    const totalTokens = inputTokens + outputTokens

    const cost = calculateTokenCost("gemini-1.5-flash", inputTokens, outputTokens)

    // Log token usage
    await logTokenUsage({
      provider: "gemini",
      model: "gemini-1.5-flash",
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
      sessionId: sessionId || "unknown",
      endpoint: "/api/chat",
    })

    // Create AI message
    const aiMessage = {
      id: `ai_${Date.now()}`,
      role: "assistant" as const,
      content: aiResponse,
      timestamp: new Date().toISOString(),
    }

    // Broadcast to real-time channel
    if (sessionId) {
      const channel = supabase.channel(`ai-showcase-${sessionId}`)
      await channel.send({
        type: "broadcast",
        event: "ai-response",
        payload: aiMessage,
      })
    }

    return NextResponse.json({
      message: aiMessage,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Handle specific error types
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
