"use client"

import { MessageList } from "./MessageList"
import { ChatComposer } from "./ChatComposer"
import { DynamicActivityIndicator } from "./DynamicActivityIndicator"
import type { Message, Activity } from "@/types/chat"

interface ChatPanelProps {
  messages: Message[]
  isTyping: boolean
  currentActivity: Activity | null
  sendMessage: (message: string) => void
  handleToolClick: (tool: string) => void
}

export function ChatPanel({ messages, isTyping, currentActivity, sendMessage, handleToolClick }: ChatPanelProps) {
  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isTyping={isTyping} />
      </div>
      <div className="shrink-0">
        <DynamicActivityIndicator activity={currentActivity} />
        <ChatComposer onSendMessage={sendMessage} onToolClick={handleToolClick} isTyping={isTyping} />
      </div>
    </div>
  )
}
