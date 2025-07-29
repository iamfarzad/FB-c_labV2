"use client"

import { useChat } from "./hooks/useChat"
import { ActivityPanel } from "./components/ActivityPanel"
import { ChatPanel } from "./components/ChatPanel"

export default function ChatPage() {
  const { messages, activities, isTyping, sendMessage, handleToolClick } = useChat()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ActivityPanel activities={activities} />
      <ChatPanel messages={messages} isTyping={isTyping} onSendMessage={sendMessage} onToolClick={handleToolClick} />
    </div>
  )
}
