"use client"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { ChatComposer } from "./ChatComposer"
import { EmptyState } from "@/app/(chat)/chat/components/EmptyState"
import { ErrorState } from "@/app/(chat)/chat/components/ErrorState"
import { MessageList } from "@/app/(chat)/chat/components/MessageList"
import { AIAvatar } from "@/components/chat/header/components/AIAvatar"
import { ExportButton } from "@/components/chat/header/components/ExportButton"
import { OnlineStatus } from "@/components/chat/header/components/OnlineStatus"

export function ChatPanel() {
  const { messages, isLoading, error, handleDownloadSummary, addMessage, onRetry } = useChatContext()

  const handleExampleQuery = (query: string) => {
    addMessage({
      id: Date.now().toString(),
      role: "user",
      content: query,
      createdAt: new Date(),
    })
  }

  const renderContent = () => {
    if (error) {
      return <ErrorState error={error} onRetry={onRetry} />
    }
    if (messages.length === 0 && !isLoading) {
      return <EmptyState onExampleQuery={handleExampleQuery} />
    }
    return (
      <MessageList
        messages={messages}
        isLoading={isLoading}
        error={error}
        onExampleQuery={handleExampleQuery}
        onRetry={onRetry}
      />
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          <AIAvatar />
          <div>
            <p className="font-semibold">AI Assistant</p>
            <OnlineStatus />
          </div>
        </div>
        <ExportButton onClick={handleDownloadSummary} />
      </header>
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
      <footer className="border-t bg-background/80 backdrop-blur-sm p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <ChatComposer />
        </div>
      </footer>
    </div>
  )
}
