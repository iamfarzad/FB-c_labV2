"use client"

import { useChatContext } from "../../context/ChatProvider"
import { MessageList } from "@/app/(chat)/chat/components/MessageList"
import { EmptyState } from "@/app/(chat)/chat/components/EmptyState"
import { ChatComposer } from "./ChatComposer"
import { Button } from "@/components/ui/button"

export function ChatPanel() {
  const { messages, isLoading, onRetry, error } = useChatContext()

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? <MessageList messages={messages} /> : <EmptyState />}
        {error && (
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-red-500">Something went wrong.</p>
            <Button onClick={onRetry} variant="outline" className="mt-2 bg-transparent">
              Retry
            </Button>
          </div>
        )}
      </div>
      <div className="border-t bg-background p-4">
        <ChatComposer />
      </div>
    </div>
  )
}
