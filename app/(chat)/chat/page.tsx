"use client"

import React from "react"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useDemoSession } from "@/components/demo-session-manager"
import { useModalManager } from "@/app/(chat)/chat/hooks/useModalManager"
import { useLeadCapture } from "@/app/(chat)/chat/hooks/useLeadCapture"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ChatContainer } from "@/app/(chat)/chat/components/ChatContainer"
import { ChatModals } from "@/app/(chat)/chat/components/ChatModals"

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, clearChat, activityLog, addActivity } = useChatContext()

  const { sessionId, createSession } = useDemoSession()
  const { activeModal, openModal, closeModal } = useModalManager()
  const { showLeadCapture, handleLeadCaptureComplete } = useLeadCapture(messages, sessionId)

  useKeyboardShortcuts({ 
    onNewChat: clearChat,
    onOpenVoice: () => openModal("voiceInput"),
    onOpenCamera: () => openModal("webcam"),
    onOpenScreenShare: () => openModal("screenShare")
  })

  // Start demo session if not already started
  React.useEffect(() => {
    if (!sessionId) {
      createSession()
    }
  }, [sessionId, createSession])

  return (
    <ChatLayout>
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        error={error ? new Error(error) : undefined}
        onExampleQuery={(query) => sendMessage(query)}
        onRetry={() => sendMessage("")}
        input=""
        handleInputChange={() => {}}
        handleSubmit={(e) => {
          e.preventDefault()
          // Handle submit
        }}
        onFileUpload={() => {}}
        onImageUpload={() => {}}
        openModal={(modal) => openModal(modal as any)}
        showLeadCapture={showLeadCapture}
        onLeadCaptureComplete={() => handleLeadCaptureComplete({ name: "User", email: "user@example.com", engagementType: "chat" })}
        leadName=""
        onDownloadSummary={() => {}}
        activities={activityLog}
        onNewChat={clearChat}
      />
      <ChatModals
        onTransferToChat={(message) => {
          console.log("Transfer to chat:", message)
          sendMessage(message)
        }}
        onCapture={(data) => {
          console.log("Capture data:", data)
          addActivity({ 
            id: Date.now().toString(),
            type: "user_action", 
            status: "completed", 
            title: "Data captured",
            description: "User data was captured",
            timestamp: Date.now()
          })
        }}
        onAnalysis={(analysis) => {
          console.log("Analysis:", analysis)
          addActivity({ 
            id: Date.now().toString(),
            type: "doc_analysis", 
            status: "completed", 
            title: "Analysis completed",
            description: "Document analysis was performed",
            timestamp: Date.now()
          })
        }}
      />
    </ChatLayout>
  )
}
