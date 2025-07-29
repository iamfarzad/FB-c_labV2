"use client"

import { useState, useCallback } from "react"
import { ChatSidebar } from "./new-ui/ChatSidebar"
import { ChatPanel } from "./new-ui/ChatPanel"
import { ChatModals } from "./ChatModals"
import type { Message, ActivityItem } from "../types/chat"

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Add activity
    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "message",
      title: "Message sent",
      status: "completed",
      timestamp: new Date().toISOString(),
      details: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
    }
    setActivities((prev) => [...prev, activity])

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand your request. How can I help you with your business needs today?",
        timestamp: new Date().toISOString(),
        model: "Gemini Pro",
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }, [])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setActivities([])
  }, [])

  const handleToolClick = useCallback((tool: string) => {
    setActiveModal(tool)

    // Add activity for tool usage
    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "tool_used",
      title: `${tool} opened`,
      status: "in_progress",
      timestamp: new Date().toISOString(),
      details: `Using ${tool} tool`,
    }
    setActivities((prev) => [...prev, activity])
  }, [])

  const handleCloseModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 shrink-0">
        <ChatSidebar activities={activities} onNewChat={handleNewChat} />
      </div>

      <div className="flex-1">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onToolClick={handleToolClick}
        />
      </div>

      <ChatModals activeModal={activeModal} onClose={handleCloseModal} />
    </div>
  )
}
