import type React from "react"
import { ChatProvider } from "./context/ChatProvider"
import { ClientErrorBoundary } from "@/components/error-boundary-client"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary>
      <ChatProvider>{children}</ChatProvider>
    </ClientErrorBoundary>
  )
}
