"use client"

import { useEffect } from "react" // Add useEffect import
import { ChatSidebar } from "./new-ui/ChatSidebar"
import { ChatPanel } from "./new-ui/ChatPanel"
import { ChatModals } from "./ChatModals"
import { useChatContext } from "../context/ChatProvider" // Import useChatContext
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
  } = useChatContext() // Use context here

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
    // Removed useCallback, now uses context
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    addMessage(userMessage) // Use context's addMessage
    setIsLoading(true) // Use context's setIsLoading

    // Add activity
    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "message",
      title: "Message Sent",
      status: "completed",
      timestamp: new Date().toISOString(),
      details: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
    }
    addActivity(activity) // Use context's addActivity

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
      addMessage(aiMessage) // Use context's addMessage
      setIsLoading(false) // Use context's setIsLoading

      // Add AI response activity
      const aiActivity: ActivityItem = {
        id: (Date.now() + 2).toString(),
        type: "message",
        title: "AI Response Generated",
        status: "completed",
        timestamp: new Date().toISOString(),
        details: "Generated intelligent response using Gemini Pro model",
      }
      addActivity(aiActivity) // Use context's addActivity
    }, 1500)
  }

  const handleNewChat = () => {
    // Removed useCallback, now uses context
    clearMessages() // Use context's clearMessages
    const activity: ActivityItem = {
      id: Date.now().toString(),
      type: "message",
      title: "New Chat Started",
      status: "completed",
      timestamp: new Date().toISOString(),
      details: "Started a new conversation session",
    }
    addActivity(activity) // Use context's addActivity
  }

  const handleToolClick = (tool: string) => {
    // Removed useCallback, now uses context
    openModal(tool) // Use context's openModal

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
    addActivity(activity) // Use context's addActivity
  }

  const handleCloseModal = () => {
    // Removed useCallback, now uses context
    if (activeModal) {
      // Update the last activity to completed when modal closes
      // This logic will be simpler with context management or a dedicated activity update function
      // For now, let's keep it in ChatInterface to quickly get it working
      addActivity({
        // Add a new activity for modal closure instead of directly modifying previous
        id: Date.now().toString(),
        type: "tool_used",
        title: `${activeModal} Closed`,
        status: "completed",
        timestamp: new Date().toISOString(),
        details: `Closed ${activeModal} functionality`,
      })
    }
    closeModal() // Use context's closeModal
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <div className="shrink-0">
        {" "}
        {/* Removed w-80 as Sidebar handles its own width */}
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
