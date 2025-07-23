"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useRealTimeActivities } from "@/hooks/use-real-time-activities"
import type { ActivityItem } from "../types/chat"

interface ChatContextType {
  activityLog: ActivityItem[]
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void
  updateActivity: (id: string, updates: Partial<ActivityItem>) => void
  clearActivities: () => void
  isConnected: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  try {
    const { activities, addActivity, updateActivity, clearActivities, isConnected } = useRealTimeActivities()

    return (
      <ChatContext.Provider
        value={{
          activityLog: activities,
          addActivity,
          updateActivity,
          clearActivities,
          isConnected,
        }}
      >
        {children}
      </ChatContext.Provider>
    )
  } catch (error) {
    console.error('Error initializing ChatProvider:', error)
    // Fallback provider with empty functions
    return (
      <ChatContext.Provider
        value={{
          activityLog: [],
          addActivity: () => {},
          updateActivity: () => {},
          clearActivities: () => {},
          isConnected: false,
        }}
      >
        {children}
      </ChatContext.Provider>
    )
  }
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
