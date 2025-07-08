"use client"

import type React from "react"

import { ChatProvider } from "./context/ChatProvider"
import { ErrorBoundary } from "@/components/error-boundary"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <ChatProvider>{children}</ChatProvider>
    </ErrorBoundary>
  )
}
