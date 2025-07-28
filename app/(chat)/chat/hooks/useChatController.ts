"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useDemoSession } from "@/components/demo-session-manager"
import type { Message } from "@/app/(chat)/chat/types/chat"

export function useChatController() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()
  const { refreshStatus, remainingTokens, remainingRequests } = useDemoSession()

  const sendMessage = useCallback(
    async (input: string, attachedFile?: { name: string; content: string }) => {
      if (remainingTokens <= 0 || remainingRequests <= 0) {
        toast({
          title: "Demo Limit Reached",
          description: "You have reached the usage limit for this demo session.",
          variant: "destructive",
        })
        return
      }

      setIsLoading(true)
      setError(null)

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            file: attachedFile,
          }),
        })

        if (!response.ok || !response.body) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to get response from AI")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantMessageContent = ""
        const assistantMessageId = (Date.now() + 1).toString()

        // Add a placeholder for the assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "...",
            createdAt: new Date(),
          },
        ])

        // Stream the response
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          assistantMessageContent += decoder.decode(value, { stream: true })
          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantMessageContent } : msg)),
          )
        }

        // Final update to ensure content is complete
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: assistantMessageContent } : msg)),
        )
      } catch (err: any) {
        setError(err)
        toast({
          title: "An error occurred",
          description: err.message,
          variant: "destructive",
        })
        // Remove the user's message on error to allow them to try again
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
        // Refresh session status to get updated token/request counts
        await refreshStatus()
      }
    },
    [messages, remainingTokens, remainingRequests, toast, refreshStatus],
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  }
}
