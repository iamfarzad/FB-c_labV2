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

    // LOGIC: Use consistent model name - Gemini 1.5 Flash (current stable model)
    // WHY: Stable, cost-effective, good for general chat conversations
    const modelName = "gemini-1.5-flash"
    const model = genAI.getGenerativeModel({ model: modelName })

    // LOGIC: Build conversation context from history
    // WHY: Maintains conversation continuity, limits to last 5 messages for cost control
    let fullPrompt = prompt
    if (conversationHistory && conversationHistory.length > 0) {
      const context = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map((msg: any) => `${msg.role}: ${msg.parts[0]?.text || ""}`)
        .join("\n")

      fullPrompt = `Previous conversation:\n${context}\n\nUser: ${prompt}`
    }

    // LOGIC: Add lead context for personalized responses
    // WHY: Enables AI to provide contextual responses based on lead information
    if (leadContext) {
      fullPrompt = `Lead context: ${JSON.stringify(leadContext)}\n\n${fullPrompt}`
    }

    console.log("Generating content with prompt:", fullPrompt.substring(0, 200) + "...")

    // LOGIC: Generate response with error handling
    // WHY: Robust error handling for API failures, rate limits, etc.
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    // LOGIC: Extract token usage for cost tracking
    // WHY: Monitor API costs, track usage patterns, billing transparency
    const usageMetadata = response.usageMetadata
    const inputTokens = usageMetadata?.promptTokenCount || 0
    const outputTokens = usageMetadata?.candidatesTokenCount || 0
    const totalTokens = usageMetadata?.totalTokenCount || inputTokens + outputTokens

    // LOGIC: Calculate costs using consistent model name
    // WHY: Accurate cost tracking across different models and providers
    const costCalculation = TokenCostCalculator.calculateCost("gemini", modelName, {
      inputTokens,
      outputTokens,
      totalTokens,
    })

    // LOGIC: Log token usage for analytics
    // WHY: Track usage patterns, optimize costs, monitor performance
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

    // LOGIC: Comprehensive error logging and handling
    // WHY: Debug issues, track failures, provide meaningful error responses
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

    // LOGIC: Categorize errors for appropriate responses
    // WHY: Different error types need different handling (rate limits vs auth errors)
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
