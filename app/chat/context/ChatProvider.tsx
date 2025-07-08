"use client"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { ActivityItem } from "../types/chat"

interface ChatContextType {
  activityLog: ActivityItem[]
  addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => string
  updateActivity: (id: string, updates: Partial<Omit<ActivityItem, "id">>) => void
  clearActivities: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([])

  const addActivity = useCallback((item: Omit<ActivityItem, "id" | "timestamp">): string => {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newActivity: ActivityItem = {
      ...item,
      id,
      timestamp: Date.now(),
    }
    setActivityLog((prev) => [newActivity, ...prev.slice(0, 99)]) // Keep last 100 activities
    return id
  }, [])

  const updateActivity = useCallback((id: string, updates: Partial<Omit<ActivityItem, "id">>) => {
    setActivityLog((prev) =>
      prev.map((activity) => (activity.id === id ? { ...activity, ...updates, timestamp: Date.now() } : activity)),
    )
  }, [])

  const clearActivities = useCallback(() => {
    setActivityLog([])
  }, [])

  const value = {
    activityLog,
    addActivity,
    updateActivity,
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
