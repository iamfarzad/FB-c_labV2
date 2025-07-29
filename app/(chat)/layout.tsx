import type { ReactNode } from "react"

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen bg-white">{children}</div>
}
