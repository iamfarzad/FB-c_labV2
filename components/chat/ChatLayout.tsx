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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed inset-0 w-full h-full bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1
      }}
      data-testid="chat-layout"
      className={cn(
        // Fixed viewport layout with modern positioning
        "fixed inset-0 w-full h-full",
        "flex flex-col overflow-hidden",
        
        // Advanced glassmorphism background with depth layers
        "bg-gradient-to-br from-background via-background/95 to-background/90",
        
        // Dynamic background with subtle animated gradients
        "before:absolute before:inset-0 before:z-0",
        "before:bg-gradient-to-br before:from-accent/5 before:via-primary/3 before:to-accent/8",
        "before:animate-pulse before:duration-[8000ms]",
        "before:pointer-events-none",
        
        // Sophisticated noise texture overlay
        "after:absolute after:inset-0 after:z-[1] after:opacity-[0.02]",
        "after:bg-[url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3C/defs%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.4\"/%3E%3C/svg%3E')]",
        "after:pointer-events-none",
        
        // Floating orbs background effect
        "relative",
        
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
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
        overflow: 'hidden',
        height: '100vh',
        width: '100vw',
      }}
    >
      {/* Floating Orbs Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute top-3/4 right-1/3 w-48 h-48 bg-gradient-to-r from-primary/8 to-accent/12 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            delay: 10
          }}
          className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-r from-accent/6 to-primary/6 rounded-full blur-2xl"
        />
      </div>

      {/* Main Content Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10"
      >
        {/* Subtle top border gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent z-20" />
        
        {children}
        
        {/* Subtle bottom border gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent z-20" />
      </motion.div>

      {/* Corner accent elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-accent/5 to-transparent rounded-br-full pointer-events-none z-[2]" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full pointer-events-none z-[2]" />
    </motion.div>
  )
}

export default ChatLayout
