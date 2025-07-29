import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "F.B/c AI Assistant",
  description: "Your next-generation AI consulting service and technology showcase.",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <main>{children}</main>
}
