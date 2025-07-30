"use client"

import { useEffect } from "react"
import { ChatSidebar } from "./new-ui/ChatSidebar"
import { ChatPanel } from "./new-ui/ChatPanel"
import { ChatModals } from "./ChatModals"
import { useChatContext } from "../context/ChatProvider"
import type { Message, ActivityItem } from "../types/chat"

export function ChatInterface() {
  const {
    messages,
    activities,
    isLoading,
    activeModal,
    addMessage,
    addActivity,
    setIsLoading,
    openModal,
    closeModal,
    clearMessages,
  } = useChatContext()

  // Initialize activities if needed, or fetch from server
  useEffect(() => {
    if (activities.length === 0) {
      // Only initialize if empty
      addActivity({
        id: "1",
        type: "lead_research",
        title: "Lead Research Completed",
        status: "completed",
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        details: "Researched 15 potential leads in the tech sector with high conversion potential",
      })
      addActivity({
        id: "2",
        type: "roi_calculation",
        title: "ROI Analysis in Progress",
        status: "in_progress",
        timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        details: "Calculating returns for Q4 marketing campaign across multiple channels",
      })
      addActivity({
        id: "3", // Add more initial activities to match screenshot
        type: "document_analysis",
        title: "AI Initialized",
        status: "completed",
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        details: "Core AI models loaded for optimal performance",
      })
      addActivity({
        id: "4",
        type: "message",
        title: "System prompt loaded",
        status: "completed",
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        details: "Loaded long_context prompt",
      })
    }
  }, [activities.length, addActivity])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    addMessage(userMessage)
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
    addActivity(activity)

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
      addMessage(aiMessage)
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
      addActivity(aiActivity)
    }, 1500)
  }

  const handleNewChat = () => {
    clearMessages()
    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "message",
      title: "New Chat Started",
      status: "completed",
      timestamp: new Date().toISOString(),
      details: "Started a new conversation session",
    }
    addActivity(activity)
  }

  const handleToolClick = (tool: string) => {
    openModal(tool)

    // Add activity for tool usage
    const toolNames: Record<string, string> = {
      "ROI Analysis": "ROI Calculator", // Update keys to match button labels
      "Lead Research": "Lead Research",
      "Image Generation": "Image Generation",
      "Document Upload": "Document Upload",
      "Video Call": "Video Call",
      "Screen Share": "Screen Share",
    }

    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "tool_used",
      title: `${toolNames[tool] || tool} Opened`,
      status: "in_progress",
      timestamp: new Date().toISOString(),
      details: `Accessing ${toolNames[tool] || tool} functionality`,
    }
    addActivity(activity)
  }

  const handleCloseModal = () => {
    if (activeModal) {
      // Add a new activity for modal closure instead of directly modifying previous
      addActivity({
        id: Date.now().toString(),
        type: "tool_used",
        title: `${activeModal} Closed`,
        status: "completed",
        timestamp: new Date().toISOString(),
        details: `Closed ${activeModal} functionality`,
      })
    }
    closeModal()
  }

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
