"use client"

import ModernChatInterface from '@/components/chat/ModernChatInterface'
import { ChatProvider } from '@/app/chat/context/ChatProvider'

export default function ModernChatPage() {
  // Example lead context - this would come from your lead capture flow
  const leadContext = {
    name: "Farzad",
    email: "farzad@example.com",
    company: "Eve"
  }

  return (
    <ChatProvider>
      <ModernChatInterface leadContext={leadContext} />
    </ChatProvider>
  )
} 