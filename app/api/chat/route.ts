import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSupabase } from "@/lib/supabase/server"
import { TokenCostCalculator } from "@/lib/token-cost-calculator"
import type { NextRequest } from "next/server"

// Define Message type locally since ai package exports are not available
interface Message {
  role: "user" | "assistant"
  content: string
  imageUrl?: string
}

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
    const { messages, data = {} } = await req.json()
    const { leadContext = {}, sessionId = null, userId = null } = data

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = "gemini-1.5-flash"

    const systemPrompt = buildSystemPrompt(leadContext)
    const userMessages = (messages as Message[]).filter((m) => m.role === "user" || m.role === "assistant")

    // Convert messages to Gemini format, handling multimodal content
    const geminiContents = userMessages.map((message) => {
      const parts: any[] = [{ text: message.content }]
      
      // Add image if present
      if (message.imageUrl) {
        // Convert base64 image to inline data
        const base64Match = message.imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
        if (base64Match) {
          parts.push({
            inlineData: {
              mimeType: `image/${base64Match[1]}`,
              data: base64Match[2]
            }
          })
        }
      }
      
      return {
        role: message.role === "assistant" ? "model" : "user",
        parts
      }
    })

    const geminiPrompt = {
      system_instruction: {
        role: "system",
        parts: [{ text: systemPrompt }],
      },
      contents: geminiContents,
    }

    // Create a streaming response
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const geminiResponse = await genAI.getGenerativeModel({ model }).generateContentStream(geminiPrompt)
          
          let fullResponse = ""
          let tokenUsage: any = null
          
          // Stream the response
          for await (const chunk of geminiResponse.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              fullResponse += chunkText
              
              // Send chunk to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunkText })}\n\n`))
            }
          }
          
          // Get final response for token usage
          const finalResponse = await geminiResponse.response
          tokenUsage = finalResponse.usageMetadata
          
          // Log token usage
          if (tokenUsage) {
            try {
              const { promptTokenCount, candidatesTokenCount, totalTokenCount } = tokenUsage
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
                metadata: { response_length: fullResponse.length },
              })
            } catch (dbError) {
              console.error("Failed to log token usage:", dbError)
            }
          }
          
          // Send final event
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
          
        } catch (error) {
          console.error("[Chat API Stream Error]", error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
    
  } catch (error: any) {
    console.error("[Chat API Error]", error)
    const status = error.status || 500
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }
}
