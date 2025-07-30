"use client"

import { useState, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { Bot, Sparkles, FileText, Search, DollarSign, ImageIcon, Video, Calendar } from "lucide-react"
import type { Message, Activity } from "../types/chat"
import type { LucideIcon } from "lucide-react"

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  const addMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message])
  }, [])

  const addActivity = useCallback((activity: Activity) => {
    setActivities((prevActivities) => [...prevActivities, activity])
    setCurrentActivity(activity)
  }, [])

  const updateActivityStatus = useCallback((id: string, status: Activity["status"]) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) => (activity.id === id ? { ...activity, status } : activity)),
    )
    setCurrentActivity((prevActivity) => (prevActivity?.id === id ? { ...prevActivity, status } : prevActivity))
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      }
      addMessage(userMessage)
      setInput("")
      setIsLoading(true)
      setIsTyping(true)

      const thinkingActivityId = uuidv4()
      addActivity({
        id: thinkingActivityId,
        icon: Sparkles,
        title: "AI is thinking...",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        type: "thinking",
      })

      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const aiResponseContent = `Hello! You said: "${text}". I'm a mock AI assistant. How can I help you further?`
      const aiMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponseContent,
        timestamp: new Date().toISOString(),
        model: "Gemini 2.5",
      }
      addMessage(aiMessage)

      updateActivityStatus(thinkingActivityId, "completed")
      setIsLoading(false)
      setIsTyping(false)
      setCurrentActivity(null)
    },
    [addMessage, addActivity, updateActivityStatus],
  )

  const handleToolClick = useCallback(
    async (tool: string) => {
      const toolActivityId = uuidv4()
      let activityTitle = ""
      let activityIcon: LucideIcon = Sparkles
      let activityType: Activity["type"] = "tool_used"

      switch (tool) {
        case "roi-analysis":
          activityTitle = "Performing ROI Analysis..."
          activityIcon = DollarSign
          activityType = "roi_calculation"
          break
        case "lead-research":
          activityTitle = "Conducting Lead Research..."
          activityIcon = Search
          activityType = "lead_research"
          break
        case "document-upload":
          activityTitle = "Uploading Document..."
          activityIcon = FileText
          activityType = "file_upload"
          break
        case "image-generation":
          activityTitle = "Generating Image..."
          activityIcon = ImageIcon
          activityType = "image_generation"
          break
        case "video-sharing":
          activityTitle = "Initiating Video Sharing..."
          activityIcon = Video
          activityType = "video_generation" // Using video_generation for video sharing for simplicity
          break
        case "screen-sharing":
          activityTitle = "Initiating Screen Sharing..."
          activityIcon = Video // Using video icon for screen sharing
          activityType = "video_generation" // Using video_generation for screen sharing for simplicity
          break
        case "model-selection":
          activityTitle = "Changing AI Model..."
          activityIcon = Bot
          activityType = "thinking" // Generic thinking for model change
          break
        case "meeting-scheduler":
          activityTitle = "Scheduling Meeting..."
          activityIcon = Calendar
          activityType = "meeting_scheduled"
          break
        default:
          activityTitle = `Using tool: ${tool}...`
          activityIcon = Sparkles
          activityType = "tool_used"
      }

      addActivity({
        id: toolActivityId,
        icon: activityIcon,
        title: activityTitle,
        status: "in_progress",
        timestamp: new Date().toISOString(),
        type: activityType,
      })

      setIsLoading(true)
      setIsTyping(true)

      await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate tool operation

      const toolResponse: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Successfully completed: ${activityTitle.replace("...", "")}`,
        timestamp: new Date().toISOString(),
        model: "Gemini 2.5",
      }
      addMessage(toolResponse)

      updateActivityStatus(toolActivityId, "completed")
      setIsLoading(false)
      setIsTyping(false)
      setCurrentActivity(null)
    },
    [addMessage, addActivity, updateActivityStatus],
  )

  return {
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    currentActivity,
    activities,
    sendMessage,
    handleToolClick,
  }
}
