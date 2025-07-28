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
  const { isModalOpen, activeModal, openModal, closeModal } = useModalManager()
  const { isLeadCaptureVisible, showLeadCapture, closeLeadCapture, handleLeadSubmit } = useLeadCapture()

  useKeyboardShortcuts(openModal)

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
        sendMessage={sendMessage}
        openModal={openModal}
        isLeadCaptureVisible={isLeadCaptureVisible}
        showLeadCapture={showLeadCapture}
        closeLeadCapture={closeLeadCapture}
        handleLeadSubmit={handleLeadSubmit}
        addActivity={addActivity}
      />
      <ChatModals
        isModalOpen={isModalOpen}
        activeModal={activeModal}
        closeModal={closeModal}
        addActivity={addActivity}
      />
    </ChatLayout>
  )
}
