import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, data } = body

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create a mock streaming response
    const mockResponse = {
      id: `mock-${Date.now()}`,
      role: 'assistant',
      content: `This is a mock response for UI testing. I received ${messages?.length || 0} messages. Session ID: ${data?.sessionId || 'unknown'}. This response simulates the real AI behavior for frontend development and testing purposes. ${messages?.length > 1 ? 'This is a longer response to test scrolling functionality. '.repeat(5) : ''}`,
      timestamp: new Date().toISOString(),
      metadata: {
        tokens: 150,
        cost: 0.002,
        model: 'gemini-pro-mock',
        processingTime: 500
      }
    }

    // Return as streaming response to match real API behavior
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the response in chunks to simulate streaming
        const chunks = [
          JSON.stringify({ type: 'start', id: mockResponse.id }),
          JSON.stringify({ type: 'content', content: mockResponse.content }),
          JSON.stringify({ type: 'metadata', metadata: mockResponse.metadata }),
          JSON.stringify({ type: 'end' })
        ]

        let index = 0
        const sendChunk = () => {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(chunks[index] + '\n'))
            index++
            setTimeout(sendChunk, 100) // Simulate streaming delay
          } else {
            controller.close()
          }
        }
        sendChunk()
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Mock chat API error:', error)
    return NextResponse.json(
      { error: 'Mock API error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
