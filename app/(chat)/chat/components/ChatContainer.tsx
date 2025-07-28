"use client"

import type React from "react"

import { ChatHeader } from "@/components/chat/ChatHeader"
import { LeadCaptureFlow } from "@/components/chat/LeadCaptureFlow"
import { MessageList } from "./MessageList"
import { ChatFooter } from "@/components/chat/ChatFooter"
import type { Message } from "../types/chat"
import type { ModalType } from "../hooks/useModalManager"
import type { LeadCaptureState } from "../types/lead-capture"

interface ChatContainerProps {
  leadName?: string
  onDownloadSummary: () => void
  activities: any[]
  onNewChat: () => void
  messages: Message[]
  isLoading: boolean
  error: Error | undefined
  onExampleQuery: (query: string) => void
  onRetry: () => void
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onFileUpload: (file: File) => void
  onImageUpload: (imageData: string, fileName: string) => void
  openModal: (modal: ModalType) => void
  showLeadCapture: boolean
  onLeadCaptureComplete: (leadData: LeadCaptureState["leadData"]) => void
  engagementType?: "chat" | "voice" | "demo"
  initialQuery?: string
}

export function ChatContainer({
  leadName,
  onDownloadSummary,
  activities,
  onNewChat,
  messages,
  isLoading,
  error,
  onExampleQuery,
  onRetry,
  input,
  handleInputChange,
  handleSubmit,
  onFileUpload,
  onImageUpload,
  openModal,
  showLeadCapture,
  onLeadCaptureComplete,
  engagementType,
  initialQuery,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden">
      <ChatHeader
        onDownloadSummary={onDownloadSummary}
        activities={activities}
        onNewChat={onNewChat}
        onActivityClick={() => {}}
        leadName={leadName}
      />
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {showLeadCapture && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <LeadCaptureFlow
              isVisible={showLeadCapture}
              onComplete={onLeadCaptureComplete}
              engagementType={engagementType}
              initialQuery={initialQuery}
            />
          </div>
        )}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onExampleQuery={onExampleQuery}
          onRetry={onRetry}
        />
      </div>
      <ChatFooter
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        onFileUpload={onFileUpload}
        onImageUpload={onImageUpload}
        openModal={openModal}
      />
    </div>
  )
}
