import { type NextRequest, NextResponse } from "next/server"
import {
  streamEducationalContent,
  extractLearningObjectives,
  extractKeyTopics,
  type EducationalInteractionData,
  type VideoLearningContext,
} from "@/lib/educational-gemini-service"

export async function POST(request: NextRequest) {
  try {
    const {
      interactionHistory,
      videoContext,
      maxHistoryLength = 5,
    }: {
      interactionHistory: EducationalInteractionData[]
      videoContext: VideoLearningContext
      maxHistoryLength?: number
    } = await request.json()

    // Validate required data
    if (!interactionHistory || interactionHistory.length === 0) {
      return NextResponse.json({ error: "No interaction history provided" }, { status: 400 })
    }

    if (!videoContext || !videoContext.generatedSpec) {
      return NextResponse.json({ error: "Video context is required" }, { status: 400 })
    }

    // Extract learning objectives and topics if not provided
    if (!videoContext.learningObjectives || videoContext.learningObjectives.length === 0) {
      videoContext.learningObjectives = extractLearningObjectives(videoContext.generatedSpec)
    }

    if (!videoContext.keyTopics || videoContext.keyTopics.length === 0) {
      videoContext.keyTopics = extractKeyTopics(videoContext.generatedSpec)
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamEducationalContent(interactionHistory, videoContext, maxHistoryLength)) {
            controller.enqueue(encoder.encode(chunk))
          }
          controller.close()
        } catch (error) {
          console.error("Error in educational content stream:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Educational content API error:", error)
    return NextResponse.json({ error: "Failed to generate educational content" }, { status: 500 })
  }
}
