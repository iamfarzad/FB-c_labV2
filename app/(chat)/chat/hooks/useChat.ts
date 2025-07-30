"use client"

import { useState } from "react"
import type { Message, Activity } from "../types/chat"
import { Bot, FileText, BarChart, Search, ImageIcon, Brain } from "lucide-react"

const initialMessages: Message[] = []

const sampleActivities: Activity[] = [
  {
    id: "1",
    icon: Search,
    title: "Lead Research",
    status: "completed",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: "lead_research",
  },
  {
    id: "2",
    icon: FileText,
    title: "Analyzed 'Q2_Report.pdf'",
    status: "completed",
    timestamp: new Date(Date.now() - 90000).toISOString(),
    type: "document_understanding",
  },
  {
    id: "3",
    icon: BarChart,
    title: "Calculated ROI for Campaign X",
    status: "failed",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    type: "roi_calculation",
  },
]

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [activities, setActivities] = useState<Activity[]>(sampleActivities)
  const [isTyping, setIsTyping] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(true)

  const sendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)
    setCurrentActivity({
      id: "thinking-1",
      icon: Brain,
      title: "Thinking...",
      status: "in_progress",
      timestamp: new Date().toISOString(),
      type: "thinking",
    })

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response to: "${content}". I can help with various tasks like analyzing documents, researching leads, or calculating ROI.`,
        timestamp: new Date().toISOString(),
        model: "Gemini 2.5",
      }
      setIsTyping(false)
      setCurrentActivity(null)
      setMessages((prev) => [...prev, aiResponse])
      setActivities((prev) => [
        {
          id: Date.now().toString(),
          icon: Bot,
          title: "Generated text response",
          status: "completed",
          timestamp: new Date().toISOString(),
          type: "text_generation",
        },
        ...prev,
      ])
    }, 2500)
  }

  const handleToolClick = (tool: string) => {
    const toolActivityMap: { [key: string]: Activity } = {
      "roi-analysis": {
        id: Date.now().toString(),
        icon: BarChart,
        title: "Starting ROI Analysis...",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        type: "roi_calculation",
      },
      "lead-research": {
        id: Date.now().toString(),
        icon: Search,
        title: "Researching leads...",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        type: "lead_research",
      },
      "image-generation": {
        id: Date.now().toString(),
        icon: ImageIcon,
        title: "Generating image...",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        type: "image_generation",
      },
    }

    const activity = toolActivityMap[tool]
    if (activity) {
      setCurrentActivity(activity)
      setActivities((prev) => [activity, ...prev])

      setTimeout(() => {
        setCurrentActivity(null)
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activity.id
              ? {
                  ...a,
                  status: "completed",
                  title: activity.title.replace("Starting ", "").replace("...", " complete"),
                }
              : a,
          ),
        )
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I have completed the ${tool} task.`,
          timestamp: new Date().toISOString(),
          model: "Gemini 2.5",
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 3000)
    }
  }

  const toggleActivityPanel = () => {
    setIsActivityPanelOpen((prev) => !prev)
  }

  return {
    messages,
    activities,
    isTyping,
    currentActivity,
    isActivityPanelOpen,
    sendMessage,
    handleToolClick,
    toggleActivityPanel,
  }
}
