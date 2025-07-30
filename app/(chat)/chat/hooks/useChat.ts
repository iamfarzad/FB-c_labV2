"use client"

import { useState, useEffect } from "react"
import type { Message, Activity } from "@/types/chat"
import {
  Brain,
  FileText,
  BarChart,
  Search,
  Zap,
  ImageIcon,
  Upload,
  Video,
  Monitor,
  type LucideIcon,
} from "lucide-react"

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm F.B/c AI. I can demonstrate advanced AI capabilities with your data in real-time. How can I help you achieve your business goals today?",
    role: "assistant",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
]

const initialActivities: Activity[] = [
  {
    id: "1",
    icon: Brain,
    title: "AI Initialized",
    status: "completed",
    timestamp: "10m ago",
    type: "thinking",
  },
  {
    id: "2",
    icon: FileText,
    title: "System prompt loaded",
    status: "completed",
    timestamp: "10m ago",
    type: "long_context",
  },
]

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [isTyping, setIsTyping] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)

  useEffect(() => {
    const inProgressActivity = activities.find((a) => a.status === "in_progress")
    setCurrentActivity(inProgressActivity || null)
  }, [activities])

  const addActivity = (title: string, icon: LucideIcon, type: Activity["type"]) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      icon,
      title,
      status: "in_progress",
      timestamp: "Just now",
      type,
    }
    setActivities((prev) => [newActivity, ...prev])

    // Simulate completion
    setTimeout(
      () => {
        setActivities((prev) =>
          prev.map((act) => (act.id === newActivity.id ? { ...act, status: "completed", timestamp: "1m ago" } : act)),
        )
      },
      2000 + Math.random() * 2000,
    )
  }

  const sendMessage = (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    addActivity("Processing input", Brain, "thinking")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thank you for your message. Based on your query, I can perform an automated ROI calculation, conduct lead research, or analyze relevant documents. Which path would you like to explore?`,
        role: "assistant",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
      addActivity("Generated AI response", Brain, "text_generation")
    }, 1500)
  }

  const handleToolClick = (tool: string) => {
    let icon: LucideIcon = Zap
    let type: Activity["type"] = "tool_used"

    switch (tool) {
      case "ROI Analysis":
        icon = BarChart
        type = "roi_calculation"
        break
      case "Lead Research":
        icon = Search
        type = "lead_research"
        break
      case "Image Generation":
        icon = ImageIcon
        type = "image_generation"
        break
      case "Document Upload":
        icon = Upload
        type = "file_upload"
        break
      case "Video Call":
        icon = Video
        type = "video_understanding"
        break
      case "Screen Share":
        icon = Monitor
        type = "video_understanding"
        break
    }

    addActivity(`Initiating ${tool}`, icon, type)

    const toolMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      timestamp: new Date().toISOString(),
      content: `Starting ${tool}. Please provide any relevant information or documents to proceed.`,
    }
    setMessages((prev) => [...prev, toolMessage])
  }

  return {
    messages,
    activities,
    isTyping,
    currentActivity,
    sendMessage,
    handleToolClick,
  }
}
