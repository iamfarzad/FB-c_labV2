"use client"

import type React from "react"

interface ChatLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function ChatLayout({ children, header, footer }: ChatLayoutProps) {
  return (
    <main className="flex flex-col h-screen bg-background">
      {header}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto overscroll-contain px-2 sm:px-4 pt-4 sm:pt-6 pb-4">
          {children}
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-border/20 bg-background/95 backdrop-blur-sm">
        <div className="min-h-[140px] pb-6 pt-2">
          {footer}
        </div>
      </div>
    </main>
  )
}
