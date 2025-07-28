"use client"

import type React from "react"

import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import { MessageList } from "./MessageList"
import { LeadCaptureFlow } from "@/components/chat/LeadCaptureFlow"
import type { Activity, Message } from "../types/chat"
import { ErrorState } from "./ErrorState"
import { EmptyState } from "./EmptyState"
import { LoadingState } from "./LoadingState"

interface ChatContainerProps {
  leadName?: string
  onDownloadSummary: () => void
  activities: Activity[]
  onNewChat: () => void
  messages: Message[]
  isLoading: boolean
  error?: Error
  onExampleQuery: (query: string) => void
  onRetry: () => void
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onFileUpload: (file: File) => void
  onImageUpload: (file: File) => void
  openModal: (modal: string) => void
  showLeadCapture: boolean
  onLeadCaptureComplete: () => void
  engagementType?: string
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
    <main className="flex-1 flex flex-col bg-background">
      <ChatHeader
        leadName={leadName}
        onDownloadSummary={onDownloadSummary}
        activities={activities}
        onNewChat={onNewChat}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : messages.length === 0 && !isLoading ? (
          <EmptyState onExampleQuery={onExampleQuery} />
        ) : (
          <>
            <MessageList messages={messages} isLoading={isLoading} />
            {isLoading && messages.length > 0 && <LoadingState />}
          </>
        )}
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        onFileUpload={onFileUpload}
        onImageUpload={onImageUpload}
        openModal={openModal}
      />
      {showLeadCapture && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <LeadCaptureFlow
            isVisible={showLeadCapture}
            onComplete={onLeadCaptureComplete}
            engagementType={engagementType}
            initialQuery={initialQuery}
          />
        </div>
      )}
    </main>
  )
}
