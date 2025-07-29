"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useChat } from "ai/react"
import type { Message } from "ai"
import { useModalManager } from "../hooks/useModalManager"
import type { ActivityItem } from "../types/chat"

interface ChatContextType {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  error: Error | undefined
  activities: ActivityItem[]
  addMessage: (message: Message) => void
  handleNewChat: () => void
  handleDownloadSummary: () => void
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
    append,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("Chat error:", err)
    },
  })

  const { openModal, closeModal, isModalOpen } = useModalManager()
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const addActivity = useCallback((activity: Omit<ActivityItem, "id" | "timestamp">) => {
    setActivities((prev) => [{ ...activity, id: Date.now().toString(), timestamp: new Date() }, ...prev])
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    addActivity({ type: "message_sent", content: `User sent: "${input}"` })
    originalHandleSubmit(e)
  }

  const addMessage = (message: Message) => {
    append(message)
  }

  const handleNewChat = useCallback(() => {
    setMessages([])
    addActivity({ type: "new_chat", content: "New chat session started." })
  }, [setMessages, addActivity])

  const handleDownloadSummary = useCallback(() => {
    // Placeholder for summary download logic
    alert("Downloading summary...")
    addActivity({ type: "export", content: "Chat summary exported." })
  }, [addActivity])

  const onRetry = useCallback(() => {
    reload()
  }, [reload])

  const value = {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    activities,
    addMessage,
    handleNewChat,
    handleDownloadSummary,
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
