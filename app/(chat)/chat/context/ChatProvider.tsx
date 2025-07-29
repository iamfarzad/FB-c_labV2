"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Message, ActiveFeatures, ModalType } from "../types/chat"
import { toast } from "sonner"

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
  handleNewChat: () => void
  activities: ActivityItem[]
  addActivity: (activity: Omit<ActivityItem, "id" | "timestamp">) => void
}

interface ActivityItem {
  id: string
  type: string
  content: string
  timestamp: string
  status?: "pending" | "in_progress" | "completed" | "failed"
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your advanced business AI assistant. I can help you with:\n\n• ROI calculations and financial analysis\n• Lead generation and research\n• Document analysis and processing\n• Meeting scheduling and management\n• Voice and video interactions\n• Screen sharing and collaboration\n\nHow can I assist you with your business today?",
      sender: "ai",
      timestamp: new Date(Date.now() - 300000),
    },
  ])

  const [isTyping, setIsTyping] = useState(false)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [activeFeatures, setActiveFeatures] = useState<ActiveFeatures>({
    voice: false,
    video: false,
    screen: false,
  })
  const [activeModal, setActiveModal] = useState<ModalType | null>(null)

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

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

  const toggleFeature = useCallback((feature: keyof ActiveFeatures) => {
    setActiveFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }, [])

  const openModal = useCallback(
    (modal: ModalType) => {
      setActiveModal(modal)
      addActivity({
        type: "modal_opened",
        content: `${modal} modal opened`,
      })
    },
    [addActivity],
  )

  const closeModal = useCallback(() => {
    if (activeModal) {
      addActivity({
        type: "modal_closed",
        content: `${activeModal} modal closed`,
      })
    }
    setActiveModal(null)
  }, [activeModal, addActivity])

  const handleNewChat = useCallback(() => {
    setMessages([
      {
        id: "1",
        content: "Hello! I'm your advanced business AI assistant. How can I help you today?",
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

  const value: ChatContextType = {
    messages,
    addMessage,
    isTyping,
    setIsTyping,
    activeFeatures,
    toggleFeature,
    activeModal,
    openModal,
    closeModal,
    handleNewChat,
    activities,
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
