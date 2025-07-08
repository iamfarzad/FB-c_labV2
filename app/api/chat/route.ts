import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenerativeAIStream, StreamingTextResponse, type Message } from "ai"
import { getSupabase } from "@/lib/supabase/server"
import { TokenCostCalculator } from "@/lib/token-cost-calculator"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const buildSystemPrompt = (leadContext: any): string => {
  let systemPrompt = `You are F.B/c AI Assistant, an expert in AI automation and business consulting.`
  if (leadContext?.name) systemPrompt += ` The user's name is ${leadContext.name}.`
  if (leadContext?.company) systemPrompt += ` They work at ${leadContext.company}.`
  if (leadContext?.role) systemPrompt += ` Their role is ${leadContext.role}.`
  if (leadContext?.interests) systemPrompt += ` They're interested in: ${leadContext.interests}.`
  systemPrompt += `\n\nProvide helpful, personalized responses about AI automation, business processes, and technology solutions. Be conversational, professional, and focus on practical business value.`
  return systemPrompt
}

export async function POST(req: NextRequest) {
  try {
    const { messages, data } = await req.json()
    const { leadContext, sessionId, userId } = data

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = "gemini-1.5-flash"

    const systemPrompt = buildSystemPrompt(leadContext)
    const userMessages = (messages as Message[]).filter((m) => m.role === "user" || m.role === "assistant")

    // Build the prompt for Gemini
    const geminiPrompt = {
      system_instruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      contents: userMessages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      })),
    }

    const geminiResponse = await genAI.getGenerativeModel({ model }).generateContentStream(geminiPrompt)

    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiResponse, {
      onFinal: async (completion) => {
        // This callback is called when the stream is finished.
        // We can use it to log the final token usage.
        try {
          const { usageMetadata } = await geminiResponse.response
          if (usageMetadata) {
            const { promptTokenCount, candidatesTokenCount, totalTokenCount } = usageMetadata
            const cost = TokenCostCalculator.calculateCost("gemini", model, {
              inputTokens: promptTokenCount,
              outputTokens: candidatesTokenCount,
              totalTokens: totalTokenCount,
            })

            const supabase = getSupabase()
            await supabase.from("token_usage_logs").insert({
              session_id: sessionId,
              provider: "gemini",
              model: model,
              input_tokens: promptTokenCount,
              output_tokens: candidatesTokenCount,
              total_tokens: totalTokenCount,
              input_cost: cost.inputCost,
              output_cost: cost.outputCost,
              total_cost: cost.totalCost,
              request_type: "chat",
              user_id: userId,
              metadata: {
                final_response_length: completion.length,
              },
            })
          }
        } catch (dbError) {
          console.error("Failed to log token usage on stream completion:", dbError)
        }
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("[Chat API Error]", error)
    const status = error.status || 500
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }
}
