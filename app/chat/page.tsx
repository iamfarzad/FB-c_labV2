"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { ChatProvider, useChatContext } from "./context/ChatProvider"
import { ChatLayout } from "@/components/chat/layout/ChatLayout"
import { ChatHeader } from "@/components/chat/layout/ChatHeader"
import { ChatMain } from "@/components/chat/layout/ChatMain"
import { ChatFooter } from "@/components/chat/layout/ChatFooter"
import { DesktopSidebar } from "@/components/chat/Sidebar/DesktopSidebar"
import { MobileSidebarSheet } from "@/components/chat/Sidebar/MobileSidebarSheet"
import { TimelineActivityLog } from "@/components/chat/activity/TimelineActivityLog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { generateFBCReport } from "@/utils/pdfGenerator"
import type { ActivityItem } from "./types/chat"
import { ApiDebugger } from "@/components/chat/debug/ApiDebugger"

function ChatPageContent() {
  const { messages, input, setInput, sendMessage, isLoading, activities, uploadFile } = useChatContext()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showDebugger, setShowDebugger] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      // Add a welcome message
      const welcomeMessage = {
        id: "welcome",
        content: `Hello! How can I assist you today?

I'm F.B/c AI Assistant, ready to help with your questions, analyze content, generate images, process videos, and much more. Just start typing!`,
        role: "assistant" as const,
        timestamp: new Date(),
      }

      // This would normally be handled by the context, but for initial state we can add it directly
      // The context will handle subsequent messages
    }
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const messageContent = input.trim()
    setInput("")
    await sendMessage(messageContent)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleDownloadSummary = async () => {
    if (messages.length === 0) return

    try {
      // Create a simple summary for PDF generation
      const summaryText = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n")
      const summaryData = {
        name: "Chat User",
        email: "user@example.com",
        companyName: "Chat Session",
        summary: summaryText,
        leadScore: 85,
        capabilitiesShown: ["Conversational AI", "Real-time Chat", "File Analysis"],
      }

      const pdfData = await generateFBCReport(summaryData)

      // Download the PDF
      const link = document.createElement("a")
      link.href = pdfData
      link.download = `chat-summary-${new Date().toISOString().split("T")[0]}.pdf`
      link.click()
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const handleFileUpload = async (file: File) => {
    await uploadFile(file)
  }

  const handleNewChat = () => {
    // Reset chat state - could be implemented in context
    window.location.reload()
  }

  const handleActivityClick = (activity: ActivityItem) => {
    console.log("Activity clicked:", activity)
  }

  return (
    <ChatLayout>
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <DesktopSidebar
            activities={activities}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onNewChat={handleNewChat}
            onActivityClick={handleActivityClick}
          />
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <MobileSidebarSheet activities={activities} onNewChat={handleNewChat} onActivityClick={handleActivityClick}>
            <TimelineActivityLog activities={activities} />
          </MobileSidebarSheet>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          <ChatHeader onMenuClick={() => setIsSidebarOpen(true)} onDownloadSummary={handleDownloadSummary} />

          {/* Debug Toggle */}
          <div className="p-2 border-b">
            <button
              onClick={() => setShowDebugger(!showDebugger)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showDebugger ? "Hide" : "Show"} API Debugger
            </button>
          </div>

          {showDebugger && (
            <div className="p-4 border-b bg-gray-50">
              <ApiDebugger />
            </div>
          )}

          <ChatMain messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />

          <ChatFooter
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onKeyPress={handleKeyPress}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </ChatLayout>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
}
