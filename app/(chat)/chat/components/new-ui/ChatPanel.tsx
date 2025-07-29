"use client"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { ChatComposer } from "./ChatComposer"
import { EmptyState } from "@/app/(chat)/chat/components/EmptyState"
import { LoadingState } from "@/app/(chat)/chat/components/LoadingState"
import { ErrorState } from "@/app/(chat)/chat/components/ErrorState"
import { MessageList } from "@/app/(chat)/chat/components/MessageList"
import { AIAvatar } from "@/components/chat/header/components/AIAvatar"
import { ExportButton } from "@/components/chat/header/components/ExportButton"

export function ChatPanel() {
  const { messages, isLoading, error, handleDownloadSummary } = useChatContext()

  const renderContent = () => {
    if (isLoading && messages.length === 0) {
      return <LoadingState />
    }
    if (error) {
      return <ErrorState error={error} />
    }
    if (messages.length === 0) {
      return <EmptyState onPromptClick={() => {}} />
    }
    return <MessageList messages={messages} />
  }

  return (
    <div className="flex h-full flex-col bg-muted/50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          <AIAvatar />
          <div>
            <p className="font-semibold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <ExportButton onClick={handleDownloadSummary} />
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl">{renderContent()}</div>
      </main>
      <footer className="border-t bg-background p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <ChatComposer />
        </div>
      </footer>
    </div>
  )
}
