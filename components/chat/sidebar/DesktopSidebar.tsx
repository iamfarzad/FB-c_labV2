"use client"

import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { SidebarContent } from "./SidebarContent"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useDevice } from "@/hooks/use-device"

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
  const device = useDevice()
  const isTablet = device === "tablet"
  const sidebarWidth = isTablet ? 280 : 320

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "h-full relative z-30 hidden md:flex flex-col border-r border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden",
              className,
            )}
            aria-label="Chat History Sidebar"
          >
            <SidebarContent
              activities={activities}
              onNewChat={onNewChat}
              onActivityClick={onActivityClick}
              onClearActivities={onClearActivities}
              onCleanupStuckActivities={onCleanupStuckActivities}
              isTablet={isTablet}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <div
        className={cn("fixed top-20 z-50 hidden md:block transition-all duration-300 ease-in-out")}
        style={{ left: isOpen ? `${sidebarWidth - 16}px` : "16px" }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "bg-background/90 backdrop-blur-md border border-border/30 rounded-lg shadow-sm hover:bg-muted hover:scale-105 transition-all duration-200",
            isTablet ? "h-8 w-8" : "h-9 w-9",
          )}
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className={cn(isTablet ? "h-3 w-3" : "h-4 w-4")} />
          ) : (
            <ChevronRight className={cn(isTablet ? "h-3 w-3" : "h-4 w-4")} />
          )}
        </Button>
      </div>
    </>
  )
}

export default DesktopSidebar
