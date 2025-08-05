"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Menu, FileText, Sparkles, Zap, Brain, Activity } from "lucide-react"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { MobileSidebarSheet } from "./sidebar/MobileSidebarSheet"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ActivityItem {
  id: string
  status: 'in_progress' | 'completed' | 'pending'
  type: string
  title: string
}

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
  const [currentTime, setCurrentTime] = useState(new Date())

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

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Update greeting when leadName changes
  useEffect(() => {
    const greetings = [
      `How can I help${leadName ? `, ${leadName}` : ''}?`,
      `What can I assist you with${leadName ? `, ${leadName}` : ''} today?`,
      `Ready to help${leadName ? `, ${leadName}` : ''}!`,
    ]
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)])
  }, [leadName])

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const activeActivities = activities.filter(a => a.status === 'in_progress').length
  const completedActivities = activities.filter(a => a.status === 'completed').length

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "glass-header",
        "flex items-center justify-between px-4 sm:px-6 py-4",
        "flex-shrink-0 z-30 relative overflow-hidden",
        className,
      )}
    >
      {/* Animated background gradient */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.03), transparent)",
            "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.05), transparent)",
            "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.03), transparent)",
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Left Section - Mobile Sidebar + AI Info */}
      <div className="flex items-center gap-4 flex-1 relative z-10">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden">
          <MobileSidebarSheet activities={activities} onNewChat={onNewChat} onActivityClick={onActivityClick}>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-11 h-11 min-h-[44px] min-w-[44px] hover:bg-accent/10 rounded-xl border border-border/20 backdrop-blur-sm"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </motion.div>
          </MobileSidebarSheet>
        </div>

        {/* AI Assistant Info */}
        <div className="flex items-center gap-4 flex-1">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative"
          >
            <Avatar
              className={cn(
                "border-2 border-accent/40 ring-4 ring-accent/10",
                "shadow-xl shadow-accent/25 backdrop-blur-sm",
                "bg-gradient-to-br from-accent/20 to-accent/10",
                // Responsive avatar sizes
                "mobile:w-10 mobile:h-10",
                "tablet:w-12 tablet:h-12",
                "desktop:w-14 desktop:h-14",
              )}
            >
              <AvatarFallback className="bg-gradient-to-br from-accent via-accent/90 to-accent/80 text-accent-foreground shadow-inner">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FbcIcon className={cn("mobile:w-5 mobile:h-5", "tablet:w-6 tablet:h-6", "desktop:w-7 desktop:h-7")} />
                </motion.div>
              </AvatarFallback>
            </Avatar>
            
            {/* Activity indicator */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full",
                "border-2 border-card shadow-lg",
                "flex items-center justify-center",
                "mobile:w-3 mobile:h-3",
                "tablet:w-4 tablet:h-4",
                "desktop:w-5 desktop:h-5"
              )}
            >
              <Sparkles className="w-2 h-2 text-white" />
            </motion.div>
          </motion.div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={greeting}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "font-bold text-foreground tracking-tight",
                    "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
                    // Responsive text sizes
                    "mobile:text-sm",
                    "tablet:text-base",
                    "desktop:text-lg",
                  )}
                >
                  {greeting}
                </motion.h1>
              </AnimatePresence>
              
              {leadName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="bg-accent/10 text-accent border-accent/20 text-xs px-2 py-0.5"
                  >
                    VIP
                  </Badge>
                </motion.div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
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
                className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-500/50 ring-2 ring-green-500/20"
              />
              
              <Badge 
                variant="secondary" 
                className={cn(
                  "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                  "border border-green-200/50 dark:border-green-800/50",
                  "backdrop-blur-sm font-medium",
                  "mobile:text-xs mobile:px-2 mobile:py-0.5",
                  "tablet:text-xs tablet:px-2 tablet:py-1",
                  "desktop:text-xs desktop:px-3 desktop:py-1"
                )}
              >
                <Brain className="w-3 h-3 mr-1" />
                AI Online • {getTimeBasedGreeting()}
              </Badge>

              {/* Activity Stats */}
              {(activeActivities > 0 || completedActivities > 0) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  {activeActivities > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      <Activity className="w-3 h-3 mr-1 animate-pulse" />
                      {activeActivities} active
                    </Badge>
                  )}
                  {completedActivities > 0 && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {completedActivities} done
                    </Badge>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-3 relative z-10">
        <motion.div 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={onDownloadSummary}
            className={cn(
              "gap-2 hover:bg-accent/10 hover:border-accent/40",
              "shadow-md hover:shadow-lg transition-all duration-300",
              "focus:ring-2 focus:ring-accent/30 focus:ring-offset-2",
              "backdrop-blur-sm border-border/30",
              "bg-card/50 hover:bg-card/80",
              // Enhanced button styling
              "rounded-xl font-medium",
              // Mobile: Icon only, larger screens: Icon + text
              "mobile:px-3 mobile:py-2",
              "tablet:px-4 tablet:py-2",
              "desktop:px-5 desktop:py-2.5",
            )}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText className={cn("mobile:w-4 mobile:h-4", "tablet:w-4 tablet:h-4", "desktop:w-4 desktop:h-4")} />
            </motion.div>
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

        {/* Time Display - Desktop only */}
        <div className="hidden desktop:block">
          <div className="text-xs text-muted-foreground font-mono bg-muted/20 px-2 py-1 rounded-lg">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
