"use client"

import React from "react"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useDemoSession } from "@/components/demo-session-manager"
import { useModalManager } from "@/app/(chat)/chat/hooks/useModalManager"
import { useLeadCapture } from "@/app/(chat)/chat/hooks/useLeadCapture"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { DesktopSidebar } from "@/components/chat/sidebar/DesktopSidebar"
import { ChatContainer } from "@/app/(chat)/chat/components/ChatContainer"
import { ChatModals } from "@/app/(chat)/chat/components/ChatModals"

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, clearChat, activityLog, addActivity } = useChatContext()

  const { sessionId, createSession } = useDemoSession()
  const { activeModal, openModal, closeModal } = useModalManager()
  const { showLeadCapture, handleLeadCaptureComplete } = useLeadCapture(messages, sessionId)

  useKeyboardShortcuts({ openModal })

  // Start demo session if not already started
  React.useEffect(() => {
    if (!sessionId) {
      createSession()
    }
  }, [sessionId, createSession])

  return (
    <ChatLayout>
      <DesktopSidebar clearChat={clearChat} activityLog={activityLog} />
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        error={error}
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
        openModal={openModal}
        showLeadCapture={showLeadCapture}
        onLeadCaptureComplete={handleLeadCaptureComplete}
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
          addActivity({ type: "capture", status: "success", content: "Data captured" })
        }}
        onAnalysis={(analysis) => {
          console.log("Analysis:", analysis)
          addActivity({ type: "analysis", status: "success", content: analysis })
        }}
      />
    </ChatLayout>
  )
}
