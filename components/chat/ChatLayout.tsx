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
      className={cn(
        "flex h-screen w-full flex-col bg-background",
        "relative overflow-hidden",
        // Mobile optimizations
        "mobile:h-[100dvh] mobile:overflow-hidden",
        // Tablet optimizations
        "tablet:h-screen",
        // Desktop optimizations
        "desktop:h-screen",
        // Remove any margin/padding that might cause layout issues
        "m-0 p-0",
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
