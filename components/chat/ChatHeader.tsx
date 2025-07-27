"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Bot, Menu, FileText, Sparkles, Zap, MessageSquare } from "lucide-react"
import { MobileSidebarSheet } from "./sidebar/MobileSidebarSheet"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ChatHeaderProps {
  onDownloadSummary: () => void
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  className?: string
  leadName?: string
}

export function ChatHeader({ onDownloadSummary, activities, onNewChat, onActivityClick, className, leadName }: ChatHeaderProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [greeting, setGreeting] = useState(`How can I help${leadName ? `, ${leadName}` : ''}?`)
  const [isTyping, setIsTyping] = useState(false)

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

  // Update greeting when leadName changes
  useEffect(() => {
    setGreeting(`How can I help${leadName ? `, ${leadName}` : ''}?`)
  }, [leadName])

  // Simulate typing effect
  useEffect(() => {
    setIsTyping(true)
    const timer = setTimeout(() => setIsTyping(false), 2000)
    return () => clearTimeout(timer)
  }, [greeting])

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "glass-header",
        "flex items-center justify-between",
        // Responsive padding
        "mobile:px-4 mobile:py-3 mobile:min-h-[64px]",
        "tablet:px-6 tablet:py-4 tablet:min-h-[72px]",
        "desktop:px-8 desktop:py-5 desktop:min-h-[80px]",
        className,
      )}
    >
      {/* Left Section - Mobile Sidebar + AI Info */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden">
          <MobileSidebarSheet activities={activities} onNewChat={onNewChat} onActivityClick={onActivityClick}>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-xl hover:bg-accent/10 hover:shadow-md transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </motion.div>
          </MobileSidebarSheet>
        </div>

        {/* AI Assistant Info */}
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative"
          >
            {/* Glowing effect */}
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
            <Avatar
              className={cn(
                "relative border-2 border-accent/30 ring-2 ring-accent/10",
                "shadow-lg shadow-accent/20 bg-gradient-to-br from-accent to-accent/80",
                // Responsive avatar sizes
                "mobile:w-10 mobile:h-10",
                "tablet:w-12 tablet:h-12",
                "desktop:w-14 desktop:h-14",
              )}
            >
              <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-inner">
                <Bot className={cn(
                  "mobile:w-5 mobile:h-5", 
                  "tablet:w-6 tablet:h-6", 
                  "desktop:w-7 desktop:h-7"
                )} />
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={greeting}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "font-semibold text-foreground text-balance",
                    // Responsive text sizes
                    "mobile:text-base",
                    "tablet:text-lg",
                    "desktop:text-xl",
                  )}
                >
                  {greeting}
                  {isTyping && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-block ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </motion.h1>
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <motion.div
                animate={{ 
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50"
              />
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
                  "border border-green-200 dark:border-green-800/30",
                  "mobile:text-xs mobile:px-2 mobile:py-1",
                  "tablet:text-xs tablet:px-2.5 tablet:py-1",
                  "desktop:text-sm desktop:px-3 desktop:py-1.5",
                  "rounded-full font-medium"
                )}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Online • Ready to help
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={onDownloadSummary}
            className={cn(
              "gap-2 hover:bg-accent/10 hover:border-accent/30",
              "shadow-sm hover:shadow-md transition-all duration-200",
              "focus:ring-2 focus:ring-accent/20 focus:ring-offset-2",
              "rounded-xl border-border/50",
              // Mobile: Icon only, larger screens: Icon + text
              "mobile:px-3 mobile:py-2",
              "tablet:px-4 tablet:py-2",
              "desktop:px-5 desktop:py-2.5",
            )}
          >
            <FileText className={cn(
              "mobile:w-4 mobile:h-4", 
              "tablet:w-4 tablet:h-4", 
              "desktop:w-4 desktop:h-4"
            )} />
            <span
              className={cn(
                // Hide text on mobile, show on larger screens
                "mobile:hidden",
                "tablet:inline",
                "desktop:inline",
                "font-medium"
              )}
            >
              Export Summary
            </span>
          </Button>
        </motion.div>
      </div>
    </motion.header>
  )
}
