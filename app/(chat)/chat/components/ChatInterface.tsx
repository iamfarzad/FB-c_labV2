"use client"

import { useState, useCallback } from "react"
import { ChatSidebar } from "./new-ui/ChatSidebar"
import { ChatPanel } from "./new-ui/ChatPanel"
import { ChatModals } from "./ChatModals"
import type { Message, ActivityItem } from "../types/chat"

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "lead_research",
      title: "Lead Research Completed",
      status: "completed",
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      details: "Researched 15 potential leads in the tech sector with high conversion potential",
    },
    {
      id: "2",
      type: "roi_calculation",
      title: "ROI Analysis in Progress",
      status: "in_progress",
      timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      details: "Calculating returns for Q4 marketing campaign across multiple channels",
    },
  ])
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
      title: "Message Sent",
      status: "completed",
      timestamp: new Date().toISOString(),
      details: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
    }
    setActivities((prev) => [activity, ...prev])

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your business requirements. Let me analyze this and provide you with actionable insights and recommendations.",
        "Based on your input, I can help you with strategic planning, ROI optimization, lead generation, or operational efficiency. What would you like to focus on?",
        "I'm processing your request using advanced AI models. I can provide comprehensive business analysis, market research, or help with decision-making processes.",
        "Thank you for the details. I'll leverage our business intelligence tools to deliver data-driven insights and strategic recommendations.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date().toISOString(),
        model: "Gemini Pro",
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)

      // Add AI response activity
      const aiActivity: ActivityItem = {
        id: (Date.now() + 2).toString(),
        type: "message",
        title: "AI Response Generated",
        status: "completed",
        timestamp: new Date().toISOString(),
        details: "Generated intelligent response using Gemini Pro model",
      }
      setActivities((prev) => [aiActivity, ...prev])
    }, 1500)
  }, [])

  const handleNewChat = useCallback(() => {
    setMessages([])
    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "message",
      title: "New Chat Started",
      status: "completed",
      timestamp: new Date().toISOString(),
      details: "Started a new conversation session",
    }
    setActivities((prev) => [activity, ...prev])
  }, [])

  const handleToolClick = useCallback((tool: string) => {
    setActiveModal(tool)

    // Add activity for tool usage
    const toolNames: Record<string, string> = {
      "roi-calc": "ROI Calculator",
      research: "Lead Research",
      analysis: "Document Analysis",
      leads: "Lead Management",
      meeting: "Meeting Scheduler",
      upload: "File Upload",
      screen: "Screen Share",
      voice: "Voice Input",
      webcam: "Webcam Capture",
    }

    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "tool_used",
      title: `${toolNames[tool] || tool} Opened`,
      status: "in_progress",
      timestamp: new Date().toISOString(),
      details: `Accessing ${toolNames[tool] || tool} functionality`,
    }
    setActivities((prev) => [activity, ...prev])
  }, [])

  const handleCloseModal = useCallback(() => {
    if (activeModal) {
      // Update the last activity to completed when modal closes
      setActivities((prev) =>
        prev.map((activity, index) =>
          index === 0 && activity.status === "in_progress" ? { ...activity, status: "completed" } : activity,
        ),
      )
    }
    setActiveModal(null)
  }, [activeModal])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
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
