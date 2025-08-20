"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ChatLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  rightRail?: React.ReactNode
  leftRail?: React.ReactNode
  className?: string
}

export function ChatLayout({ children, header, footer, rightRail, leftRail, className }: ChatLayoutProps) {
  return (
    <main className={cn(
      "flex flex-col h-[100dvh] overflow-hidden bg-background",
      "supports-[height:100dvh]:h-[100dvh]", // Use dynamic viewport height when supported
      "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
      "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
      className
    )}>
      {header}
      
      {/* Main content area - flexible height */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {rightRail ? (
          <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 md:px-6 h-full grid grid-cols-1 lg:grid-cols-[72px_minmax(0,1fr)_320px] gap-6">
            {/* Left Toolbar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                {leftRail}
              </div>
            </aside>
            {/* Main content column */}
            <div className="min-h-0 h-full flex flex-col items-stretch">
              {children}
            </div>
            {/* Right Rail */}
            <aside className="hidden lg:block min-h-0">
              <div className="sticky top-24">
                {rightRail}
              </div>
            </aside>
          </div>
        ) : (
          children
        )}
      </div>
      
      {/* Footer - fixed height with mobile keyboard optimization */}
      <div className="flex-shrink-0 border-t border-border/20 bg-background/95 backdrop-blur-sm supports-[height:100dvh]:pb-[max(env(safe-area-inset-bottom),0px)]">
        <div className={cn(
          "px-2 sm:px-4 py-2 sm:py-4",
          "min-h-[88px] sm:min-h-[100px]", // Optimized for mobile touch
          "safe-area-inset-bottom", // Handle mobile safe areas
          "relative z-10" // Ensure footer stays above content
        )}>
          {footer}
        </div>
      </div>
    </main>
  )
}
