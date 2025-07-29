"use client"

import type React from "react"

import { useState } from "react"
import { ChatLayout } from "./components/chat-layout"
import { ChatPanel } from "./components/chat-panel"
import { ChatSidebar } from "./components/chat-sidebar"
import type { Message } from "./types"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm a modern AI assistant. How can I help you today?",
    },
    {
      id: "2",
      role: "user",
      content: "I need to analyze my company's recent sales data.",
    },
    {
      id: "3",
      role: "assistant",
      content: "Of course. Please upload the sales data file, and I'll get right on it.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Thank you. I'm analyzing the data now and will provide insights shortly.",
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center">
      <ChatLayout
        sidebar={<ChatSidebar />}
        chatPanel={
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSubmit={handleSubmit}
          />
        }
      />
    </main>
  )
}
