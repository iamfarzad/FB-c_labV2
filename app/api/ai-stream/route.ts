import { GoogleGenAI } from "@google/genai"
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

    // Validate input
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

    // Initialize Gemini AI
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    // Convert conversation history to the correct format
    const history = Array.isArray(conversationHistory)
      ? conversationHistory.map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: String(msg.content || msg.parts?.[0]?.text || "") }],
        }))
      : []

    const config = {
      responseMimeType: "text/plain",
    };

    const response = await genAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      config,
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: trimmedPrompt }],
        },
      ],
    });
    const supabase = getSupabase()

    if (enableStreaming) {
      // Streaming response
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            // Log AI request start
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

            let fullText = ""
            let chunkCount = 0

            for await (const chunk of response) {
              const text = chunk.text
              if (text) {
                fullText += text
                chunkCount++

                // Log streaming chunk
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

                controller.enqueue(encoder.encode(`data: ${text}\n\n`))
              }
            }

            // Broadcast final response
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

            // Log completion
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

            controller.enqueue(encoder.encode("event: done\ndata: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Streaming error:", error)

            // Log error
            const channel = supabase.channel(`ai-stream-${sessionId || "default"}`)
            await channel.send({
              type: "broadcast",
              event: "activity-update",
              payload: {
                id: `ai_stream_${Date.now()}`,
                type: "ai_stream", // Use ai_stream instead of error
                title: "AI Response Incomplete",
                description: "Response could not be completed",
                status: "completed", // Use completed instead of failed
                timestamp: new Date().toISOString(),
                details: [
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
      // Standard response
      let fullText = ""
      for await (const chunk of response) {
        const text = chunk.text
        if (text) {
          fullText += text
        }
      }

      const channel = supabase.channel(`ai-standard-${sessionId || "default"}`)

      const aiResponsePayload = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: fullText,
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
        content: fullText,
        length: fullText.length,
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

// Handle OPTIONS for CORS
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
