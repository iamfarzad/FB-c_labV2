"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useModalManager } from "../hooks/useModalManager"
import type { Message, ActivityItem, ModalType } from "../types/chat"
import { toast } from "sonner"

interface ChatContextType {
  messages: Message[]
  activities: ActivityItem[]
  addMessage: (message: Message) => void
  handleNewChat: () => void
  activeModal: ModalType
  openModal: (modal: ModalType) => void
  closeModal: () => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  activeFeatures: {
    video: boolean
    screen: boolean
    voice: boolean
  }
  toggleFeature: (feature: "video" | "screen" | "voice") => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI assistant. I can help you with business analysis, document processing, voice interactions, and more. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(Date.now() - 600000),
    },
  ])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [activeFeatures, setActiveFeatures] = useState({
    video: false,
    screen: false,
    voice: false,
  })
  const { activeModal, openModal, closeModal } = useModalManager()

  const addActivity = useCallback((activity: Omit<ActivityItem, "id" | "timestamp">) => {
    setActivities((prev) => [
      {
        ...activity,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ])
  }, [])

  const addMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => [...prev, message])
      addActivity({
        type: "message_sent",
        content: `New message from ${message.sender}`,
      })
    },
    [addActivity],
  )

  const handleNewChat = useCallback(() => {
    setMessages([
      {
        id: "1",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
    setActivities([])
    addActivity({
      type: "new_chat",
      content: "New chat session started",
    })
    toast.success("New chat started")
  }, [addActivity])

  const toggleFeature = useCallback(
    (feature: "video" | "screen" | "voice") => {
      setActiveFeatures((prev) => ({
        ...prev,
        [feature]: !prev[feature],
      }))

      if (feature === "voice") {
        openModal("voiceInput")
      } else if (feature === "video") {
        openModal("webcam")
      } else if (feature === "screen") {
        openModal("screenShare")
      }
    },
    [openModal],
  )

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
        isTyping,
        setIsTyping,
        activeFeatures,
        toggleFeature,
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
