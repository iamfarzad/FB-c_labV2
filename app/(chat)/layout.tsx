import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Chat - F.B/c",
  description: "Intelligent AI assistant for business analysis and automation strategies",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
