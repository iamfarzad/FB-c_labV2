"use client"

import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { SidebarContent } from "./SidebarContent"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sidebar, Activity } from "lucide-react"
import { useEffect, useState } from "react"

interface DesktopSidebarProps {
  activities: ActivityItem[]
  isOpen: boolean
  onToggle: () => void
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  onClearActivities?: () => void
  onCleanupStuckActivities?: () => void
  className?: string
}

export const DesktopSidebar = ({
  activities,
  isOpen,
  onToggle,
  onNewChat,
  onActivityClick,
  onClearActivities,
  onCleanupStuckActivities,
  className,
}: DesktopSidebarProps) => {
  const [isTablet, setIsTablet] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  // Responsive sidebar width with enhanced sizing
  const sidebarWidth = isTablet ? 300 : 360
  const activeActivities = (activities || []).filter(a => a.status === 'in_progress').length
  const completedActivities = (activities || []).filter(a => a.status === 'completed').length

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: -20 }}
            animate={{ width: sidebarWidth, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1],
              layout: { duration: 0.3 }
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
              "h-full relative z-30 hidden md:flex flex-col overflow-hidden",
              // Advanced glassmorphism with depth
              "bg-card/60 backdrop-blur-2xl",
              "border-r border-border/20",
              "shadow-xl shadow-black/10",
              className,
            )}
          >
            {/* Animated background gradient */}
            <motion.div
              animate={{
                background: isHovered
                  ? "linear-gradient(180deg, rgba(255,165,0,0.03), transparent, rgba(255,165,0,0.02))"
                  : "linear-gradient(180deg, rgba(255,165,0,0.01), transparent, rgba(255,165,0,0.01))"
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
            />

            {/* Sidebar Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-4 border-b border-border/20 relative z-10"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg"
                >
                  <Activity className="w-4 h-4 text-accent-foreground" />
                </motion.div>
                <div>
                  <h2 className="font-semibold text-sm text-foreground">Activity Center</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeActivities > 0 ? `${activeActivities} active` : `${completedActivities} completed`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Sidebar Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 relative z-10"
            >
              <SidebarContent
                activities={activities}
                onNewChat={onNewChat}
                onActivityClick={onActivityClick}
                onClearActivities={onClearActivities}
                onCleanupStuckActivities={onCleanupStuckActivities}
                isTablet={isTablet}
              />
            </motion.div>

            {/* Subtle border accents */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Toggle Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className={cn(
          "fixed top-24 z-50 hidden md:block transition-all duration-400",
          isOpen ? `left-[${sidebarWidth - 24}px]` : "left-4",
        )}
        style={{
          left: isOpen ? `${sidebarWidth - 24}px` : '16px'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "bg-card/90 backdrop-blur-2xl border border-border/30 rounded-xl shadow-lg hover:shadow-xl",
              "hover:bg-accent/10 hover:border-accent/30 transition-all duration-300",
              "group relative overflow-hidden",
              // Responsive sizing
              "tablet:h-10 tablet:w-10",
              "desktop:h-11 desktop:w-11",
            )}
            onClick={onToggle}
          >
            {/* Button background animation */}
            <motion.div
              animate={isOpen ? { x: "100%" } : { x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent"
            />
            
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {isOpen ? (
                <ChevronLeft className={cn("tablet:h-4 tablet:w-4", "desktop:h-5 desktop:w-5")} />
              ) : (
                <ChevronRight className={cn("tablet:h-4 tablet:w-4", "desktop:h-5 desktop:w-5")} />
              )}
            </motion.div>

            {/* Hover indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
            />
          </Button>
        </motion.div>

        {/* Activity indicator badge */}
        {activeActivities > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <span className="text-xs font-bold text-white">{activeActivities}</span>
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 bg-card/95 backdrop-blur-sm border border-border/30 rounded-lg px-3 py-2 shadow-lg pointer-events-none",
            "text-xs font-medium text-foreground whitespace-nowrap",
            isOpen ? "right-full mr-3" : "left-full ml-3"
          )}
        >
          {isOpen ? "Hide sidebar" : "Show activity center"}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-card/95 border rotate-45",
            isOpen ? "right-0 translate-x-1/2 border-l-0 border-b-0" : "left-0 -translate-x-1/2 border-r-0 border-t-0"
          )} />
        </motion.div>
      </motion.div>
    </>
  )
}

export default DesktopSidebar
