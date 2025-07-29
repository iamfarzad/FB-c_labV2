"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useModalManager } from "../hooks/useModalManager"
import type { Message, ActivityItem, ModalType } from "../types/chat"

interface ChatContextType {
  messages: Message[]
  activities: ActivityItem[]
  addMessage: (message: Message) => void
  handleNewChat: () => void
  activeModal: ModalType
  openModal: (modal: ModalType) => void
  closeModal: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const { activeModal, openModal, closeModal } = useModalManager()

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
    setActivities((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "message",
        timestamp: new Date().toLocaleTimeString(),
        description: `New message from ${message.role}`,
      },
    ])
  }, [])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setActivities([])
  }, [])

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "Hello! How can I help you today?",
          createdAt: new Date(),
        },
      ])
    }
  }, [messages.length])

  return (
    <ChatContext.Provider
      value={{
        messages,
        activities,
        addMessage,
        handleNewChat,
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
