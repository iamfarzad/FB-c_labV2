"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useChatController } from "@/app/(chat)/chat/hooks/useChatController"
import type { ActivityLog, ChatState } from "@/app/(chat)/chat/types/chat"

interface ChatContextType extends ChatState {
  activityLog: ActivityLog[]
  addActivity: (activity: ActivityLog) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const chatController = useChatController()

  const addActivity = useCallback((activity: ActivityLog) => {
    setActivityLog((prev) => [...prev, activity])
  }, [])

  const value = {
    ...chatController,
    activityLog,
    addActivity,
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
