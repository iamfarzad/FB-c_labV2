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
  const [viewportHeight, setViewportHeight] = useState("100vh")

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      
      // Use dynamic viewport height for mobile
      if (width < 768) {
        setViewportHeight("100dvh")
      } else {
        setViewportHeight("100vh")
      }
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    
    // Handle viewport height changes on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewportHeight(`${window.innerHeight}px`)
      }
    }
    
    window.addEventListener("orientationchange", handleResize)
    
    return () => {
      window.removeEventListener("resize", checkDevice)
      window.removeEventListener("orientationchange", handleResize)
    }
  }, [])

  return (
    <div
      className={cn(
        "chat-container w-full bg-background",
        "relative overflow-hidden",
        // Mobile optimizations
        isMobile && "mobile:h-[100dvh] mobile:overflow-hidden",
        // Tablet optimizations
        isTablet && "tablet:h-screen",
        // Desktop optimizations
        !isMobile && !isTablet && "desktop:h-screen",
        className,
      )}
      style={{ height: viewportHeight }}
      data-mobile={isMobile}
      data-tablet={isTablet}
    >
      {children}
    </div>
  )
}

export default ChatLayout
