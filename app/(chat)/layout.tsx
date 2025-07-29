"use client"

import type React from "react"

import { ChatProvider } from "./chat/context/ChatProvider"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <div className="h-screen overflow-hidden">{children}</div>
    </ChatProvider>
  )
}
