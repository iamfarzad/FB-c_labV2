import type React from "react"
import { ChatProvider } from "./context/ChatProvider"
import { ClientErrorBoundary } from "@/components/error-boundary-client"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary>
      <ChatProvider>
        <div className="flex flex-col h-screen bg-background">
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </ChatProvider>
    </ClientErrorBoundary>
  )
}
