"use client"

import type React from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FloatingChatButton } from "@/components/floating-chat-button"

interface LayoutProps {
  children: React.ReactNode
  theme: "light" | "dark"
  onThemeToggle: () => void
}

export const Layout: React.FC<LayoutProps> = ({ children, theme, onThemeToggle }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onThemeToggle={onThemeToggle} />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingChatButton theme={theme} />
    </div>
  )
}
