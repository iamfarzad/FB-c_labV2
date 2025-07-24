"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Bot, Menu } from "lucide-react"
import { MobileSidebarSheet } from "./sidebar/MobileSidebarSheet"
import type { ActivityItem } from "@/app/chat/types/chat"
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

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex items-center justify-between p-4 border-b border-border/20",
        // Modern glassmorphism with depth
        "bg-card/40 backdrop-blur-xl glass-header",
        "shadow-sm shadow-black/5",
        // Mobile optimizations
        "mobile:px-3 mobile:py-3 mobile:min-h-[60px]",
        // Tablet optimizations
        "tablet:px-4 tablet:py-3 tablet:min-h-[64px]",
        // Desktop optimizations
        "desktop:px-6 desktop:py-4 desktop:min-h-[72px]",
        className,
      )}
    >
      {/* Left Section - Mobile Sidebar + AI Info */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden">
          <MobileSidebarSheet activities={activities} onNewChat={onNewChat} onActivityClick={onActivityClick}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent/10">
                <Menu className="w-4 h-4" />
              </Button>
            </motion.div>
          </MobileSidebarSheet>
        </div>

        {/* AI Assistant Info */}
        <div className="flex items-center gap-3 flex-1">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar
              className={cn(
                "border-2 border-accent/30 ring-2 ring-accent/10",
                "shadow-lg shadow-accent/20",
                // Responsive avatar sizes
                "mobile:w-8 mobile:h-8",
                "tablet:w-10 tablet:h-10",
                "desktop:w-12 desktop:h-12",
              )}
            >
              <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-inner">
                <Bot className={cn("mobile:w-4 mobile:h-4", "tablet:w-5 tablet:h-5", "desktop:w-6 desktop:h-6")} />
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={greeting}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={cn(
                    "font-semibold text-foreground",
                    // Responsive text sizes
                    "mobile:text-sm",
                    "tablet:text-base",
                    "desktop:text-lg",
                  )}
                >
                  {greeting}
                </motion.h1>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1">
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
              <span className={cn("text-muted-foreground", "mobile:text-xs", "tablet:text-sm", "desktop:text-sm")}>
                Online • Ready to help
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <motion.div 
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={onDownloadSummary}
            className={cn(
              "gap-2 hover:bg-accent/10 hover:border-accent/30",
              "shadow-sm hover:shadow-md transition-all duration-200",
              // Mobile: Icon only, larger screens: Icon + text
              "mobile:px-2",
              "tablet:px-3",
              "desktop:px-4",
            )}
          >
            <Download className={cn("mobile:w-4 mobile:h-4", "tablet:w-4 tablet:h-4", "desktop:w-4 desktop:h-4")} />
            <span
              className={cn(
                // Hide text on mobile, show on larger screens
                "mobile:hidden",
                "tablet:inline",
                "desktop:inline",
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
