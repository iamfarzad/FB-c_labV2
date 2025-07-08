"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { ActivityItem } from "../types/chat"

interface ChatContextType {
  activityLog: ActivityItem[]
  addActivity: (activity: ActivityItem) => void
  clearActivities: () => void
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])

  const addActivity = useCallback((activity: ActivityItem) => {
    setActivityLog((prev) => [
      ...prev,
      {
        ...activity,
        id: activity.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: activity.timestamp || new Date(),
      },
    ])
  }, [])

  const clearActivities = useCallback(() => {
    setActivityLog([])
  }, [])

  const updateActivity = useCallback((id: string, updates: Partial<ActivityItem>) => {
    setActivityLog((prev) => prev.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity)))
  }, [])

  const value: ChatContextType = {
    activityLog,
    addActivity,
    clearActivities,
    updateActivity,
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
