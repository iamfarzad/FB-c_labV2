"use client"

import { ChatProvider } from "./context/ChatProvider"
import { ChatInterface } from "./components/ChatInterface"
import { ChatModals } from "./components/ChatModals"

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="h-screen bg-white">
        <ChatInterface />
        <ChatModals />
      </div>
    </ChatProvider>
  )
}
