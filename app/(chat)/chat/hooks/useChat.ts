"use client"

import type React from "react"

import { useState } from "react"
import type { Message, Activity } from "@/types/chat"
import { Brain, FileText, BarChart, Search, Zap } from "lucide-react"

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm F.B/c AI, your next-generation AI consulting service. I can demonstrate the power of advanced AI with your own data in real-time. How can I help you achieve your business goals today?",
    sender: "ai",
    timestamp: new Date(Date.now() - 600000),
  },
]

const initialActivities: Activity[] = [
  { id: "1", icon: Brain, title: "AI Initialized", status: "completed", timestamp: "10m ago" },
  { id: "2", icon: FileText, title: "System prompt loaded", status: "completed", timestamp: "10m ago" },
]

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [isTyping, setIsTyping] = useState(false)

  const addActivity = (title: string, icon: React.ElementType) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      icon,
      title,
      status: "in_progress",
      timestamp: "Just now",
    }
    setActivities((prev) => [newActivity, ...prev])

    // Simulate completion
    setTimeout(
      () => {
        setActivities((prev) => prev.map((act) => (act.id === newActivity.id ? { ...act, status: "completed" } : act)))
      },
      1000 + Math.random() * 1000,
    )
  }

  const sendMessage = (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    addActivity("Processing user input", Brain)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your message about "${content.substring(0, 30)}...". Based on this, I can initiate a deeper analysis. For example, I can perform an automated ROI calculation, conduct lead research, or analyze relevant documents you provide. Which path would you like to explore?`,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
      addActivity("Generated AI response", Brain)
    }, 1500)
  }

  const handleToolClick = (tool: string) => {
    let icon = Zap
    if (tool === "ROI Analysis") icon = BarChart
    if (tool === "Lead Research") icon = Search
    addActivity(`Initiating ${tool}`, icon)

    const toolMessage: Message = {
      id: Date.now().toString(),
      sender: "ai",
      timestamp: new Date(),
      content: `Starting ${tool}. Please provide any relevant information or documents to proceed.`,
    }
    setMessages((prev) => [...prev, toolMessage])
  }

  return {
    messages,
    activities,
    isTyping,
    sendMessage,
    handleToolClick,
  }
}
