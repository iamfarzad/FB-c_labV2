"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Radio } from "lucide-react"
import type { ActivityItem } from "@/app/chat/types/chat"
import { TimelineActivityLog } from "../activity/TimelineActivityLog"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SidebarContentProps {
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  onClearActivities?: () => void
  isTablet?: boolean
}

export const SidebarContent = ({ activities, onNewChat, onActivityClick, onClearActivities, isTablet = false }: SidebarContentProps) => {
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

      {/* Live Activity Status */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        className={cn(
          "px-4 py-3 border-b border-border/20", 
          "bg-muted/20 backdrop-blur-sm",
          isTablet && "px-3 py-2"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Radio className={cn("text-accent", isTablet ? "w-3 h-3" : "w-4 h-4")} />
            </motion.div>
            <span className={cn("font-medium", isTablet ? "text-xs" : "text-sm")}>Live AI Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              animate={{ 
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50" 
            />
            <span className={cn("text-muted-foreground", isTablet ? "text-xs" : "text-sm")}>Real-time</span>
          </div>
        </div>
      </motion.div>

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
    </div>
  )
}

export default SidebarContent
