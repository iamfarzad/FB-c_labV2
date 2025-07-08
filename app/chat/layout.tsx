import type React from "react"
import { ChatProvider } from "./context/ChatProvider"

export default function ChatAppLayout({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>
}
