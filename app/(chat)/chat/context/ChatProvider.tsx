"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useChat } from "ai/react"
import { useModalManager } from "../hooks/useModalManager"
import type { ActivityItem, Message } from "../types/chat"
import { toast } from "sonner"

interface ChatContextType {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  error: Error | undefined
  activities: ActivityItem[]
  handleNewChat: () => void
  openModal: (modal: "screenShare" | "voiceInput" | "webcam") => void
  closeModal: (modal: "screenShare" | "voiceInput" | "webcam") => void
  isModalOpen: (modal: "screenShare" | "voiceInput" | "webcam") => boolean
  onRetry: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onError: (err) => {
      toast.error("An error occurred: " + err.message)
    },
  })

  const { openModal, closeModal, isModalOpen } = useModalManager()
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const addActivity = useCallback((activity: Omit<ActivityItem, "id" | "timestamp">) => {
    setActivities((prev) => [{ ...activity, id: Date.now().toString(), timestamp: new Date() }, ...prev])
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    addActivity({ type: "message_sent", content: `User sent: "${input}"` })
    originalHandleSubmit(e)
  }

  const handleNewChat = useCallback(() => {
    setMessages([])
    addActivity({ type: "new_chat", content: "New chat session started." })
    toast.success("New chat started")
  }, [setMessages, addActivity])

  const onRetry = useCallback(() => {
    addActivity({ type: "tool_used", content: "Retrying last message." })
    reload()
  }, [reload, addActivity])

  const value = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    activities,
    handleNewChat,
    openModal,
    closeModal,
    isModalOpen,
    onRetry,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
