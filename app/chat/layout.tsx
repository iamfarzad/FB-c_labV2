import type React from "react"
import { ChatProvider } from "./context/ChatProvider"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>
}
