import type React from "react"
import { ChatProvider } from "./chat/context/ChatProvider"
import { Toaster } from "@/components/ui/sonner"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      {children}
      <Toaster />
    </ChatProvider>
  )
}
