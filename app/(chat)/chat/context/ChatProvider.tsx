"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Message, ActivityItem } from "../types/chat"

interface ChatContextType {
  messages: Message[]
  activities: ActivityItem[]
  isLoading: boolean
  activeModal: string | null
  addMessage: (message: Message) => void
  addActivity: (activity: ActivityItem) => void
  setIsLoading: (loading: boolean) => void
  openModal: (modal: string) => void
  closeModal: () => void
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const addActivity = (activity: ActivityItem) => {
    setActivities((prev) => [activity, ...prev])
  }

  const openModal = (modal: string) => {
    setActiveModal(modal)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        activities,
        isLoading,
        activeModal,
        addMessage,
        addActivity,
        setIsLoading,
        openModal,
        closeModal,
        clearMessages,
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
