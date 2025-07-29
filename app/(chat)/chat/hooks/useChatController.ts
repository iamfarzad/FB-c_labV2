"use client"

import { useState } from "react"
import type { Message } from "../types/chat"

export function useChatController() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about: "${content}". I'm here to help with your business needs including ROI analysis, lead generation, document analysis, and meeting scheduling. How can I assist you further?`,
        timestamp: new Date(),
        model: "Gemini Pro",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const newChat = () => {
    setMessages([])
  }

  return {
    messages,
    isLoading,
    sendMessage,
    newChat,
  }
}
