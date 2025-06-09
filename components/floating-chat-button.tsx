"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare } from "lucide-react"

interface FloatingChatButtonProps {
  theme: "light" | "dark"
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ theme }) => {
  const pathname = usePathname()

  // Don't show on chat page
  if (pathname === "/chat") return null

  return (
    <Link href="/chat">
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 z-50 group"
        aria-label="Open chat"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        <div className="relative flex items-center justify-center">
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        </div>

        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-[var(--color-orange-accent)] opacity-20 animate-ping" />
      </button>
    </Link>
  )
}
