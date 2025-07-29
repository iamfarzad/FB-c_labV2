"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Message, ActivityItem } from "../types/chat"

interface ChatContextType {
  messages: Message[]
  activities: ActivityItem[]
  isLoading: boolean
  addMessage: (message: Message) => void
  addActivity: (activity: ActivityItem) => void
  setLoading: (loading: boolean) => void
  clearChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const addActivity = (activity: ActivityItem) => {
    setActivities((prev) => [...prev, activity])
  }

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const clearChat = () => {
    setMessages([])
    setActivities([])
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        activities,
        isLoading,
        addMessage,
        addActivity,
        setLoading,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
