"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Radio } from "lucide-react"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { TimelineActivityLog } from "../activity/TimelineActivityLog"
import { DemoSessionCard } from "./DemoSessionCard"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SidebarContentProps {
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  onClearActivities?: () => void
  onCleanupStuckActivities?: () => void
  isTablet?: boolean
}

export const SidebarContent = ({ activities, onNewChat, onActivityClick, onClearActivities, onCleanupStuckActivities, isTablet = false }: SidebarContentProps) => {
  const liveActivities = activities.filter((a) => a.status === "in_progress" || a.status === "pending").length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "p-4 border-b border-border/20",
          "bg-card/30 backdrop-blur-sm",
          // Responsive padding
          isTablet && "p-3",
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            className={cn(
              "font-semibold text-foreground",
              // Responsive text size
              isTablet ? "text-sm" : "text-base",
            )}
          >
            Chat History
          </h2>
          <div className="flex items-center gap-2">
            {activities.length > 0 && onCleanupStuckActivities && (
              <Button
                onClick={onCleanupStuckActivities}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isTablet ? "h-6 px-2 text-xs" : "h-7 px-2 text-xs"
                )}
                title="Clean up stuck activities"
              >
                Fix
              </Button>
            )}
            {activities.length > 0 && onClearActivities && (
              <Button
                onClick={onClearActivities}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isTablet ? "h-6 px-2 text-xs" : "h-7 px-2 text-xs"
                )}
              >
                Clear
              </Button>
            )}
            {liveActivities > 0 && (
              <Button
                onClick={async () => {
                  try {
                    await fetch('/api/cleanup-activities', { method: 'POST' })
                    // Refresh the page to reload activities
                    window.location.reload()
                  } catch (error) {
                    console.error('Failed to cleanup activities:', error)
                  }
                }}
                variant="ghost"
                size="sm"
                className={cn(
                  "text-red-500 hover:text-red-700 hover:bg-red-50",
                  isTablet ? "h-6 px-2 text-xs" : "h-7 px-2 text-xs"
                )}
                title="Clean up stale activities"
              >
                Clean
              </Button>
            )}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Button
            onClick={onNewChat}
            variant="outline"
            className={cn(
              "w-full justify-start gap-2",
              "hover:bg-accent/10 hover:border-accent/30",
              "shadow-sm hover:shadow-md transition-all duration-200",
              // Responsive sizing
              isTablet ? "h-8 text-sm" : "h-9",
            )}
          >
            <Plus className={cn(isTablet ? "w-3 h-3" : "w-4 h-4")} />
            New Chat
          </Button>
        </motion.div>
      </motion.div>

      {/* Minimal Live Activity Status */}
      {liveActivities > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "px-4 py-2 border-b border-border/20", 
            "bg-blue-50/30 dark:bg-blue-950/20",
            isTablet && "px-3 py-1.5"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Radio className={cn("text-blue-500", isTablet ? "w-3 h-3" : "w-4 h-4")} />
              </motion.div>
              <span className={cn("text-blue-700 dark:text-blue-300 font-medium", isTablet ? "text-xs" : "text-sm")}>
                {liveActivities} AI task{liveActivities !== 1 ? 's' : ''} active
              </span>
            </div>
            <Badge variant="secondary" className={cn("bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", isTablet ? "text-xs px-1.5" : "text-xs")}>
              Live
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Activity Timeline */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        className="flex-1 overflow-hidden"
      >
        <ScrollArea className="h-full">
          <div className={cn("p-4", isTablet && "p-3")}>
            <TimelineActivityLog activities={activities} onActivityClick={onActivityClick} isCompact={isTablet} />
          </div>
        </ScrollArea>
      </motion.div>

      {/* Demo Session Card - Fixed at bottom */}
      <DemoSessionCard isTablet={isTablet} />
    </div>
  )
}

export default SidebarContent
