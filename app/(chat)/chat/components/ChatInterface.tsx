"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChatContext } from "../context/ChatProvider"
import type { Message } from "../types/chat"
import { ChatSidebar } from "./new-ui/ChatSidebar"
import { ChatPanel } from "./new-ui/ChatPanel"
import { ChatModals } from "./ChatModals"
import { useModalManager } from "../hooks/useModalManager"
import { useChatController } from "../hooks/useChatController"
import type { ActivityItem } from "../types/chat"

interface ChatInterfaceProps {
  activeConversationTitle?: string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeConversationTitle = "Business Strategy" }) => {
  const { messages, addMessage, isTyping, setIsTyping, openModal } = useChatContext()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const modalManager = useModalManager()
  const chatController = useChatController()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    addMessage(userMessage)
    setNewMessage("")
    setIsTyping(true)

    // Simulate AI response with business context
    setTimeout(
      () => {
        const responses = [
          "I'll analyze your business requirements and provide strategic insights. Let me process this information and generate actionable recommendations.",
          "Based on your input, I can help with lead generation, ROI analysis, document processing, or strategic planning. What would you like to focus on?",
          "I'm processing your request using our advanced AI models. I can provide business analysis, market research, or help with operational optimization.",
          "Thank you for the details. I'll leverage our business intelligence tools to provide comprehensive insights and recommendations.",
        ]

        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: "ai",
          timestamp: new Date(),
        }

        addMessage(aiResponse)
        setIsTyping(false)
      },
      1500 + Math.random() * 1000,
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleToolClick = (tool: string) => {
    switch (tool) {
      case "voice":
        openModal("voiceInput")
        break
      case "webcam":
        openModal("webcam")
        break
      case "screen":
        openModal("screenShare")
        break
      case "upload":
        fileInputRef.current?.click()
        break
      case "roi":
        console.log("ROI Calculator tool clicked")
        break
      case "research":
        console.log("Lead Research tool clicked")
        break
      case "analysis":
        console.log("Document Analysis tool clicked")
        break
      case "leads":
        console.log("Lead Generation tool clicked")
        break
      case "meeting":
        console.log("Schedule Meeting tool clicked")
        break
      default:
        console.log(`${tool} tool clicked`)
    }
  }

  const handleNewChat = () => {
    chatController.clearMessages()
    console.log("Starting new chat...")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <ChatSidebar activities={activities} onNewChat={handleNewChat} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatPanel messages={messages} isLoading={isTyping} onSendMessage={handleSendMessage} onOpenModal={openModal} />
      </div>

      {/* Modals */}
      <ChatModals modalState={modalManager.modalState} onCloseModal={modalManager.closeModal} />
    </div>
  )
}
