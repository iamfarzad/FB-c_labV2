"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Message, ActiveFeatures, ModalType } from "../types/chat"

interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  activeFeatures: ActiveFeatures
  toggleFeature: (feature: keyof ActiveFeatures) => void
  activeModal: ModalType | null
  openModal: (modal: ModalType) => void
  closeModal: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI assistant. I can help you with business analysis, document processing, voice interactions, and more. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(Date.now() - 600000),
    },
  ])

  const [isTyping, setIsTyping] = useState(false)
  const [activeFeatures, setActiveFeatures] = useState<ActiveFeatures>({
    voice: false,
    video: false,
    screen: false,
  })
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message])
  }

  const toggleFeature = (feature: keyof ActiveFeatures) => {
    setActiveFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }

  const openModal = (modal: ModalType) => {
    setActiveModal(modal)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        isTyping,
        setIsTyping,
        activeFeatures,
        toggleFeature,
        activeModal,
        openModal,
        closeModal,
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
