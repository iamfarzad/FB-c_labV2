"use client"

import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { SidebarContent } from "./SidebarContent"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
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

  // Responsive sidebar width
  const sidebarWidth = isTablet ? 280 : 320

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
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            className={cn(
              "h-full relative z-30 hidden md:flex flex-col",
              "bg-card/80 backdrop-blur-xl border-r border-border/30",
              "shadow-xl shadow-black/5",
              className,
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Sidebar Header */}
            <motion.div
              className="flex items-center justify-between p-4 border-b border-border/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">Activity Log</span>
              </div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-lg hover:bg-accent/10 transition-all duration-200"
                  onClick={onToggle}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Sidebar Content */}
            <SidebarContent
              activities={activities}
              onNewChat={onNewChat}
              onActivityClick={onActivityClick}
              onClearActivities={onClearActivities}
              onCleanupStuckActivities={onCleanupStuckActivities}
              isTablet={isTablet}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.div
        className={cn(
          "fixed top-20 z-50 hidden md:block transition-all duration-300",
          isOpen ? `left-[${sidebarWidth - 32}px]` : "left-4",
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative"
        >
          {/* Glowing effect when hovered */}
          <motion.div
            className="absolute inset-0 bg-accent/20 rounded-xl blur-lg"
            animate={{
              opacity: isHovered ? 0.5 : 0,
              scale: isHovered ? 1.2 : 1
            }}
            transition={{ duration: 0.2 }}
          />
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative bg-background/90 backdrop-blur-md border border-border/30 rounded-xl shadow-lg",
              "hover:bg-accent/10 hover:border-accent/30 hover:shadow-xl transition-all duration-200",
              // Responsive sizing
              "tablet:h-10 tablet:w-10",
              "desktop:h-11 desktop:w-11",
            )}
            onClick={onToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className={cn(
                    "tablet:h-4 tablet:w-4", 
                    "desktop:h-5 desktop:w-5"
                  )} />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1"
                >
                  <Sparkles className={cn(
                    "tablet:h-3 tablet:w-3", 
                    "desktop:h-4 desktop:w-4"
                  )} />
                  <ChevronRight className={cn(
                    "tablet:h-4 tablet:w-4", 
                    "desktop:h-5 desktop:w-5"
                  )} />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </motion.div>
    </>
  )
}

export default DesktopSidebar
