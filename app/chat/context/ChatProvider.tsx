"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useChat } from "ai/react"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger, type ActivityLog } from "@/lib/activity-logger"
import { supabase } from "@/lib/supabase/client"
import type { LeadCaptureData } from "@/app/chat/types/lead-capture"

interface ChatContextType {
  // Chat functionality
  messages: any[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  append: (message: any) => void

  // Activity tracking
  activities: ActivityLog[]
  addActivity: (activity: Omit<ActivityLog, "timestamp">) => void

  // Lead management
  leadData: LeadCaptureData | null
  setLeadData: (data: LeadCaptureData) => void

  // Session management
  sessionId: string
  clearSession: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [leadData, setLeadData] = useState<LeadCaptureData | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    append,
  } = useChat({
    api: "/api/chat",
    body: {
      leadContext: leadData,
      sessionId,
      userId: leadData?.email || "anonymous",
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })

      addActivity({
        type: "error",
        title: "Chat Message Failed",
        description: error.message,
        status: "failed",
      })
    },
    onFinish: (message) => {
      addActivity({
        type: "chat_response",
        title: "AI Response Generated",
        description: `Response: ${message.content.substring(0, 100)}...`,
        status: "completed",
      })
    },
  })

  const addActivity = useCallback((activity: Omit<ActivityLog, "timestamp">) => {
    const newActivity: ActivityLog = {
      ...activity,
      timestamp: new Date().toISOString(),
    }

    setActivities((prev) => [newActivity, ...prev.slice(0, 49)]) // Keep last 50

    // Log to backend
    activityLogger.log(newActivity).catch(console.error)
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim()) return

      addActivity({
        type: "user_message",
        title: "Message Sent",
        description: `User: ${input.substring(0, 100)}...`,
        status: "completed",
      })

      originalHandleSubmit(e)
    },
    [input, addActivity, originalHandleSubmit],
  )

  const clearSession = useCallback(() => {
    setActivities([])
    setLeadData(null)
    // Clear chat messages would need to be implemented in the useChat hook
  }, [])

  // Set up real-time activity updates
  useEffect(() => {
    const channel = supabase
      .channel("activity_updates")
      .on("broadcast", { event: "activity_logged" }, (payload) => {
        const activity = payload.payload as ActivityLog
        setActivities((prev) => [activity, ...prev.slice(0, 49)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Initial activity log
  useEffect(() => {
    addActivity({
      type: "session_start",
      title: "Chat Session Started",
      description: "Welcome to F.B/c AI Assistant",
      status: "completed",
    })
  }, [addActivity])

  const value: ChatContextType = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    activities,
    addActivity,
    leadData,
    setLeadData,
    sessionId,
    clearSession,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
