"use client"

import { useState, useCallback } from "react"

interface UseAIStreamOptions {
  onChunk?: (text: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: string) => void
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState("")

  const streamAI = useCallback(
    async (prompt: string, memory?: any, context?: Array<{ role: string; content: string }>, tools?: string[]) => {
      setIsStreaming(true)
      setStreamedText("")

      try {
        const response = await fetch("/api/ai-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            memory,
            context,
            tools,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to start AI stream")
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error("No response body")
        }

        let fullText = ""
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const text = line.slice(6)
              if (text === "[DONE]") {
                setIsStreaming(false)
                options.onComplete?.(fullText)
                return fullText
              }

              fullText += text
              setStreamedText(fullText)
              options.onChunk?.(text)
            }
          }
        }
      } catch (error) {
        console.error("AI streaming error:", error)
        setIsStreaming(false)
        options.onError?.(error instanceof Error ? error.message : "Unknown error")
      }
    },
    [options],
  )

  return {
    streamAI,
    isStreaming,
    streamedText,
    clearStream: () => setStreamedText(""),
  }
}
