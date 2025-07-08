"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { ActivityItem } from "../types/chat"

interface ChatContextType {
  activityLog: ActivityItem[]
  addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void
  clearActivities: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])

  const addActivity = useCallback((item: Omit<ActivityItem, "id" | "timestamp">) => {
    const newActivity: ActivityItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }
    setActivityLog((prev) => [newActivity, ...prev])
  }, [])

  const clearActivities = useCallback(() => {
    setActivityLog([])
  }, [])

  const value = {
    activityLog,
    addActivity,
    clearActivities,
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
