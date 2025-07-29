"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { useChatController } from "../hooks/useChatController"
import { useModalManager } from "../hooks/useModalManager"
import type { Message, Activity } from "../types/chat"
import { useDemoSession } from "@/components/demo-session-manager"

interface ChatContextType {
  messages: Message[]
  activities: Activity[]
  input: string
  isLoading: boolean
  error: Error | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  addMessage: (message: Message) => void
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void
  handleNewChat: () => void
  handleDownloadSummary: () => void
  modals: ReturnType<typeof useModalManager>["modals"]
  openModal: ReturnType<typeof useModalManager>["openModal"]
  closeModal: ReturnType<typeof useModalManager>["closeModal"]
  closeAllModals: ReturnType<typeof useModalManager>["closeAllModals"]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<Error | null>(null)
  const { isSessionActive } = useDemoSession()

  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "timestamp">) => {
      if (!isSessionActive) return
      const newActivity: Activity = {
        ...activity,
        id: Date.now().toString(),
        timestamp: new Date(),
      }
      setActivities((prev) => [newActivity, ...prev])
    },
    [isSessionActive],
  )

  const chatController = useChatController(addActivity)
  const modalManager = useModalManager()

  const handleNewChat = useCallback(() => {
    // Implementation for handleNewChat
  }, [])

  const handleDownloadSummary = useCallback(() => {
    // Implementation for handleDownloadSummary
  }, [])

  const value = useMemo(
    () => ({
      ...chatController,
      activities,
      addActivity,
      error,
      setError,
      handleNewChat,
      handleDownloadSummary,
      ...modalManager,
    }),
    [chatController, activities, addActivity, error, modalManager],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
