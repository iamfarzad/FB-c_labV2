"use client"

import type React from "react"
import { ChatProvider } from "./chat/context/ChatProvider"
import { ThemeProvider } from "@/components/theme-provider"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ChatProvider>
        <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">{children}</div>
      </ChatProvider>
    </ThemeProvider>
  )
}
