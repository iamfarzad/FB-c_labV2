"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ChatLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function ChatLayout({ children, header, footer, className }: ChatLayoutProps) {
  return (
    <main className={cn(
      "flex flex-col h-[100dvh] bg-background",
      "supports-[height:100dvh]:h-[100dvh]", // Use dynamic viewport height when supported
      className
    )}>
      {header}
      
      {/* Main content area - flexible height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
      
      {/* Footer - fixed height */}
      <div className="flex-shrink-0 border-t border-border/20 bg-background/95 backdrop-blur-sm">
        <div className={cn(
          "px-2 sm:px-4 py-2 sm:py-4",
          "min-h-[80px] sm:min-h-[100px]", // Smaller on mobile
          "safe-area-inset-bottom" // Handle mobile safe areas
        )}>
          {footer}
        </div>
      </div>
    </main>
  )
}
