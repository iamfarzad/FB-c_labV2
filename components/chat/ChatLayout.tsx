"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      data-testid="chat-layout"
      className={cn(
        // Fixed viewport layout - no scrolling at this level
        "fixed inset-0 w-full h-full bg-background",
        "flex flex-col overflow-hidden",
        // Modern glassmorphism background with depth
        "before:absolute before:inset-0 before:bg-gradient-to-br",
        "before:from-accent/8 before:via-transparent before:to-primary/8",
        "before:pointer-events-none",
        // Subtle noise texture for depth
        "after:absolute after:inset-0 after:opacity-[0.015]",
        "after:bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]",
        "after:pointer-events-none",
        // Mobile optimizations
        "mobile:h-[100dvh]",
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
        // Prevent any scrolling at the layout level
        overflow: 'hidden',
        // Use viewport units for consistent sizing
        height: '100vh',
        width: '100vw',
      }}
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

export default ChatLayout
