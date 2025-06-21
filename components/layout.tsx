"use client"

import React from "react"
import { Header } from "./header"
import { Footer } from "./footer"
import { FloatingChatButton } from "./floating-chat-button"

interface LayoutProps {
  children: React.ReactNode
  theme?: "light" | "dark"
  onThemeToggle?: () => void
  showFloatingChat?: boolean
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  theme, 
  onThemeToggle,
  showFloatingChat = true 
}) => {
  return (
    <div className="relative min-h-screen bg-background">
      <Header theme={theme} onThemeToggle={onThemeToggle} />
      
      {/* Main Content with padding for fixed header */}
      <main className="pt-16">
        {children}
      </main>
      
      <Footer />
      
      {/* Floating Chat Button */}
      {showFloatingChat && <FloatingChatButton />}
    </div>
  )
}
