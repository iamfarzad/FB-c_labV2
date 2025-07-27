"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ChatLayoutProps {
  children: ReactNode
  className?: string
}

export const ChatLayout = ({ children, className }: ChatLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    
    // Set loaded state after initial render
    const timer = setTimeout(() => setIsLoaded(true), 100)
    
    return () => {
      window.removeEventListener("resize", checkDevice)
      clearTimeout(timer)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1
      }}
      data-testid="chat-layout"
      className={cn(
        "layout-container",
        // Modern gradient background with depth
        "relative overflow-hidden",
        // Sophisticated background pattern
        "before:absolute before:inset-0 before:bg-gradient-to-br",
        "before:from-background before:via-background before:to-accent/5",
        "before:pointer-events-none",
        // Subtle noise texture for depth
        "after:absolute after:inset-0 after:opacity-[0.02]",
        "after:bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]",
        "after:pointer-events-none",
        // Responsive optimizations
        "mobile:h-[100dvh] mobile:min-h-[100dvh]",
        "tablet:h-screen tablet:min-h-screen",
        "desktop:h-screen desktop:min-h-screen",
        className,
      )}
      data-mobile={isMobile}
      data-tablet={isTablet}
      data-loaded={isLoaded}
      style={{
        // Ensure smooth scrolling and prevent layout shifts
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
        // Modern backdrop filter for depth
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)',
      }}
    >
      {/* Animated background elements */}
      <AnimatePresence>
        {isLoaded && (
          <>
            {/* Floating accent elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.05, scale: 1 }}
              transition={{ duration: 2, delay: 0.8 }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Main content container */}
      <motion.div 
        className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Subtle border accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 border border-border/20 rounded-none" />
      </div>
    </motion.div>
  )
}

export default ChatLayout
