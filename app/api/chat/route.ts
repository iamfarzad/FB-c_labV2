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

    // Use consistent model name - Gemini 1.5 Flash (current stable model)
    const modelName = "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: modelName })

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

    // Generate response with error handling
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    // Get token usage from response
    const usageMetadata = response.usageMetadata
    const inputTokens = usageMetadata?.promptTokenCount || 0
    const outputTokens = usageMetadata?.candidatesTokenCount || 0
    const totalTokens = usageMetadata?.totalTokenCount || inputTokens + outputTokens

    // Calculate costs using consistent model name
    const costCalculation = TokenCostCalculator.calculateCost("gemini", modelName, {
      inputTokens,
      outputTokens,
      totalTokens,
    })

    // Log token usage
    await TokenCostCalculator.logUsage(
      "gemini",
      modelName,
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
      model: modelName,
      provider: "gemini",
      success: true,
    })
  } catch (error: any) {
    console.error("Chat API error:", error)

    // Log activity with proper error handling
    try {
      await logActivity({
        type: "error",
        description: `Chat API error: ${error.message}`,
        metadata: {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        },
        sessionId: req.headers.get("x-session-id") || "unknown",
      })
    } catch (logError) {
      console.error("Failed to log activity:", logError)
    }

    // Return appropriate error response
    const isRateLimited = error.message?.includes("quota") || error.message?.includes("rate")
    const isInvalidKey = error.message?.includes("API key") || error.message?.includes("authentication")

    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: isRateLimited
          ? "Rate limit exceeded. Please try again later."
          : isInvalidKey
            ? "API configuration error."
            : "An unexpected error occurred.",
        success: false,
        retryable: isRateLimited,
      },
      { status: isRateLimited ? 429 : isInvalidKey ? 401 : 500 },
    )
  }
}
