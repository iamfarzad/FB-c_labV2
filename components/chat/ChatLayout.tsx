"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ChatLayoutProps {
  children: ReactNode
  className?: string
}

export const ChatLayout = ({ children, className }: ChatLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return (
    <div
      data-testid="chat-layout"
      className={cn(
        "flex flex-col h-screen w-full bg-background",
        "relative overflow-hidden transition-all",
        // Mobile optimizations
        "mobile:h-[100dvh] mobile:overflow-hidden",
        // Tablet optimizations
        "tablet:h-screen",
        // Desktop optimizations
        "desktop:h-screen",
        className,
      )}
      data-mobile={isMobile}
      data-tablet={isTablet}
      style={{
        // Ensure the layout doesn't shift when scrolling on mobile
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        // Prevent layout shift by reserving space for scrollbar
        scrollbarGutter: 'stable',
        // Prevent layout from expanding with content
        maxHeight: '100vh',
      }}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default ChatLayout
