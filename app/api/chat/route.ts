import { GoogleGenerativeAI } from "@google/generative-ai"
import { logActivity } from "@/lib/activity-logger"
import { TokenCostCalculator } from "@/lib/token-cost-calculator"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, conversationHistory, leadContext, sessionId } = body

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Use Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Build conversation context
    let fullPrompt = prompt
    if (conversationHistory && conversationHistory.length > 0) {
      const context = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map((msg: any) => `${msg.role}: ${msg.parts[0]?.text || ""}`)
        .join("\n")

      fullPrompt = `Previous conversation:\n${context}\n\nUser: ${prompt}`
    }

    // Add lead context if available
    if (leadContext) {
      fullPrompt = `Lead context: ${JSON.stringify(leadContext)}\n\n${fullPrompt}`
    }

    console.log("Generating content with prompt:", fullPrompt.substring(0, 200) + "...")

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    // Get token usage from response
    const usageMetadata = response.usageMetadata
    const inputTokens = usageMetadata?.promptTokenCount || 0
    const outputTokens = usageMetadata?.candidatesTokenCount || 0
    const totalTokens = usageMetadata?.totalTokenCount || inputTokens + outputTokens

    // Calculate costs using Gemini 2.5 Flash pricing
    const costCalculation = TokenCostCalculator.calculateCost("gemini", "gemini-2.5-flash", {
      inputTokens,
      outputTokens,
      totalTokens,
    })

    // Log token usage
    await TokenCostCalculator.logUsage(
      "gemini",
      "gemini-2.5-flash",
      { inputTokens, outputTokens, totalTokens },
      sessionId,
      undefined,
      {
        promptLength: fullPrompt.length,
        responseLength: text.length,
        hasLeadContext: !!leadContext,
        conversationLength: conversationHistory?.length || 0,
      },
    )

    console.log("Generated response:", text.substring(0, 200) + "...")
    console.log("Token usage:", { inputTokens, outputTokens, totalTokens })
    console.log("Cost:", costCalculation)

    return NextResponse.json({
      content: text,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
      cost: costCalculation,
      model: "gemini-2.5-flash",
      provider: "gemini",
      success: true,
    })
  } catch (error: any) {
    console.error("Chat API error:", error)

    // Log activity
    await logActivity({
      type: "error",
      description: `Chat API error: ${error.message}`,
      metadata: { error: error.message },
      sessionId: req.headers.get("x-session-id") || "unknown",
    })

    // Return detailed error information
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
