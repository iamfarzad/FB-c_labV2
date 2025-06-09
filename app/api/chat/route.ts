import { GoogleGenAI } from "@google/genai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, imageData, cameraFrame } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set")
    }

    const genAI = new GoogleGenAI({
      apiKey: apiKey,
    })

    // Convert messages to the correct format
    const lastMessage = messages[messages.length - 1]
    let prompt = lastMessage.content

    // Add context from previous messages
    if (messages.length > 1) {
      const context = messages
        .slice(0, -1)
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join("\n")
      prompt = `Context:\n${context}\n\nUser: ${prompt}`
    }

    const parts = [{ text: prompt }]

    // Add image data if provided
    if (imageData || cameraFrame) {
      const imageToUse = imageData || cameraFrame
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageToUse.startsWith("data:") ? imageToUse.split(",")[1] : imageToUse,
        },
      })
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      systemInstruction:
        "You are F.B/c AI, a helpful and intelligent assistant with vision capabilities. Be conversational, helpful, and engaging.",
    })

    const response = result.response
    const text = response.text()

    // Create a simple streaming response
    const stream = new ReadableStream({
      start(controller) {
        // Split text into chunks for streaming effect
        const words = text.split(" ")
        let index = 0

        const sendChunk = () => {
          if (index < words.length) {
            const chunk = words[index] + " "
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            index++
            setTimeout(sendChunk, 50) // Delay between words
          } else {
            controller.close()
          }
        }

        sendChunk()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
