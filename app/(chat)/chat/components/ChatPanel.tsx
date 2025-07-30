"use client"

import { useRef, useEffect } from "react"
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        })
      }
    }
  }, [messages, isTyping])

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isTyping={isTyping} />
      </div>
      <div className="shrink-0 relative">
        <DynamicActivityIndicator activity={currentActivity} />
        <ChatComposer onSendMessage={sendMessage} onToolClick={handleToolClick} isTyping={isTyping} />
      </div>
    </div>
  )
}
