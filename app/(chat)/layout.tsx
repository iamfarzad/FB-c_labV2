import type { ReactNode } from "react"
import { ChatProvider } from "./chat/context/ChatProvider"
import { Toaster } from "@/components/ui/sonner"

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <div className="h-screen bg-white">
        {children}
        <Toaster />
      </div>
    </ChatProvider>
  )
}
