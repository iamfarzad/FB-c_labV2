"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useDevice } from "@/hooks/use-device"

interface ChatLayoutProps {
  children: ReactNode
  className?: string
}

export const ChatLayout = ({ children, className }: ChatLayoutProps) => {
  const { isMobile, isTablet } = useDevice()

  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col bg-background",
        "relative overflow-hidden",
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
    >
      {children}
    </div>
  )
}

export default ChatLayout
