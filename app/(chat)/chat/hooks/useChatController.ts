"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useCompletion } from "ai/react"
import type { Message, Activity } from "../types/chat"
import jsPDF from "jspdf"

export function useChatController(addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void) {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<Error | null>(null)

  const {
    input,
    handleInputChange,
    handleSubmit: handleAISubmit,
    isLoading,
    stop,
    setMessages: setCompletionMessages,
    setInput,
  } = useCompletion({
    api: "/api/chat",
    onFinish: (prompt, completion) => {
      addActivity({ type: "response_received", details: "AI response finished." })
    },
    onError: (e) => {
      setError(e)
      addActivity({ type: "error", details: `AI Error: ${e.message}` })
    },
  })

  const addMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message])
      setCompletionMessages((prev) => [...prev, message])
    },
    [setCompletionMessages],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input) return
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        createdAt: new Date(),
      }
      addMessage(userMessage)
      addActivity({ type: "message_sent", details: `User sent: "${input}"` })
      handleAISubmit(e)
    },
    [input, addActivity, handleAISubmit, addMessage],
  )

  const handleNewChat = useCallback(() => {
    setMessages([])
    setCompletionMessages([])
    setInput("")
    stop()
    addActivity({ type: "session_reset", details: "New chat session started." })
  }, [stop, addActivity, setCompletionMessages, setInput])

  const handleDownloadSummary = useCallback(() => {
    if (messages.length === 0) return
    addActivity({ type: "export", details: "User downloaded chat summary." })
    const doc = new jsPDF()
    doc.setFontSize(10)
    let y = 10
    messages.forEach((msg) => {
      const text = `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)} (${msg.createdAt.toLocaleTimeString()}): ${msg.content}`
      const splitText = doc.splitTextToSize(text, 180)
      if (y + splitText.length * 5 > 280) {
        doc.addPage()
        y = 10
      }
      doc.text(splitText, 10, y)
      y += splitText.length * 5 + 5
    })
    doc.save("chat-summary.pdf")
  }, [messages, addActivity])

  return {
    messages,
    input,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
    addMessage,
    handleNewChat,
    handleDownloadSummary,
  }
}
