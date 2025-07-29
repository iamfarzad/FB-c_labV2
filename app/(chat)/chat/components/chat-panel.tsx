"use client"

import type * as React from "react"
import { ChatComposer } from "./chat-composer"
import { MessageList } from "./message-list"
import type { Message } from "../types"

interface ChatPanelProps {
  messages: Message[]
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function ChatPanel({ messages, input, setInput, isLoading, onSubmit }: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background px-6">
        <h2 className="text-lg font-semibold">Q3 Sales Analysis</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <div className="border-t bg-background px-6 py-4">
        <ChatComposer input={input} setInput={setInput} isLoading={isLoading} onSubmit={onSubmit} />
      </div>
    </div>
  )
}
