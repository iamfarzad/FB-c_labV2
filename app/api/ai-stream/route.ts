import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

interface StreamRequestBody {
  prompt?: string
  conversationHistory?: any[]
  enableStreaming?: boolean
  enableTools?: boolean
  sessionId?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: StreamRequestBody = await req.json()
    const { prompt, conversationHistory, enableStreaming = true, sessionId } = body

    // LOGIC: Validate input thoroughly
    // WHY: Prevent empty/invalid requests that waste API calls
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Valid prompt is required",
        },
        { status: 400 },
      )
    }

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt cannot be empty",
        },
        { status: 400 },
      )
    }

    // LOGIC: Use Gemini 2.5 Flash for streaming
    // WHY: Better streaming performance, lower latency, cost-effective
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7, // Balanced creativity
        topP: 0.8, // Focus on likely tokens
        topK: 40, // Limit token choices
        maxOutputTokens: 2048, // Control response length
      },
    })

    // LOGIC: Convert conversation history to Gemini format
    // WHY: Gemini expects specific role/parts structure
    const history = Array.isArray(conversationHistory)
      ? conversationHistory.map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: String(msg.content || msg.parts?.[0]?.text || "") }],
        }))
      : []

    const chat = model.startChat({ history })
    const supabase = getSupabase()

    if (enableStreaming) {
      // LOGIC: Server-Sent Events (SSE) streaming
      // WHY: Real-time response delivery, better UX, progressive loading
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // LOGIC: Real-time activity logging via Supabase channels
            // WHY: Live monitoring, debugging, user activity tracking
            const channel = supabase.channel(`ai-stream-${sessionId || "default"}`)

            await channel.send({
              type: "broadcast",
              event: "activity-update",
              payload: {
                id: `ai_request_${Date.now()}`,
                type: "ai_request",
                title: "Processing AI Request",
                description: "Sending request to Gemini AI",
                status: "in_progress",
                timestamp: new Date().toISOString(),
                details: [
                  `Model: Gemini 2.5 Flash`,
                  `Input length: ${trimmedPrompt.length} characters`,
                  `History: ${history.length} messages`,
                ],
              },
            })

            // LOGIC: Stream response in chunks
            // WHY: Progressive loading, better perceived performance
            const result = await chat.sendMessageStream(trimmedPrompt)
            let fullText = ""
            let chunkCount = 0

            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                fullText += text
                chunkCount++

                // LOGIC: Log each streaming chunk
                // WHY: Monitor streaming performance, debug issues
                await channel.send({
                  type: "broadcast",
                  event: "activity-update",
                  payload: {
                    id: `stream_chunk_${Date.now()}_${chunkCount}`,
                    type: "stream_chunk",
                    title: "AI Response Chunk",
                    description: `Chunk ${chunkCount}: ${text.slice(0, 50)}${text.length > 50 ? "..." : ""}`,
                    status: "completed",
                    timestamp: new Date().toISOString(),
                    details: [`Chunk size: ${text.length} characters`, `Total so far: ${fullText.length} characters`],
                  },
                })

                // LOGIC: Send SSE formatted data
                // WHY: Standard SSE format for client consumption
                controller.enqueue(encoder.encode(`data: ${text}\n\n`))
              }
            }

            // LOGIC: Broadcast final response via Supabase
            // WHY: Real-time updates to connected clients
            await channel.send({
              type: "broadcast",
              event: "ai-response",
              payload: {
                id: `msg-${Date.now()}`,
                role: "assistant",
                content: fullText,
                timestamp: new Date().toISOString(),
                sources: [],
                audioData: null,
              },
            })

            // LOGIC: Log completion metrics
            // WHY: Performance monitoring, usage analytics
            await channel.send({
              type: "broadcast",
              event: "activity-update",
              payload: {
                id: `ai_complete_${Date.now()}`,
                type: "ai_stream",
                title: "AI Response Complete",
                description: `Generated ${fullText.length} characters in ${chunkCount} chunks`,
                status: "completed",
                timestamp: new Date().toISOString(),
                details: [
                  `Total length: ${fullText.length} characters`,
                  `Chunks: ${chunkCount}`,
                  `Model: Gemini 2.5 Flash`,
                ],
              },
            })

            // LOGIC: Signal stream completion
            // WHY: Client needs to know when streaming is done
            controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)

            // LOGIC: Error handling in streaming context
            // WHY: Graceful error recovery, user notification
            const channel = supabase.channel(`ai-stream-${sessionId || "default"}`)
            await channel.send({
              type: "broadcast",
              event: "activity-update",
              payload: {
                id: `ai_error_${Date.now()}`,
                type: "error",
                title: "AI Request Failed",
                description: error instanceof Error ? error.message : "Unknown streaming error",
                status: "failed",
                timestamp: new Date().toISOString(),
                details: [
                  `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                  `Prompt length: ${trimmedPrompt.length}`,
                  `History length: ${history.length}`,
                ],
              },
            })

            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    } else {
      // LOGIC: Standard non-streaming response
      // WHY: Fallback for clients that don't support streaming
      const result = await chat.sendMessage(trimmedPrompt)
      const response = result.response
      const text = response.text()

      const channel = supabase.channel(`ai-standard-${sessionId || "default"}`)

      const aiResponsePayload = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: text,
        timestamp: new Date().toISOString(),
        sources: [],
        audioData: null,
      }

      await channel.send({
        type: "broadcast",
        event: "ai-response",
        payload: aiResponsePayload,
      })

      return NextResponse.json({
        success: true,
        content: text,
        length: text.length,
        model: "gemini-2.5-flash",
      })
    }
  } catch (error: any) {
    console.error("Error in AI stream handler:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// LOGIC: CORS handling for cross-origin requests
// WHY: Enable frontend to call API from different domains
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
