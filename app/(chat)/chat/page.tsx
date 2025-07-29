"use client"

import { ChatInterface } from "./components/ChatInterface"
import { ChatModals } from "./components/ChatModals"

export default function ChatPage() {
  return (
    <>
      <ChatInterface activeConversationTitle="Business AI Assistant" />
      <ChatModals />
    </>
  )
}
