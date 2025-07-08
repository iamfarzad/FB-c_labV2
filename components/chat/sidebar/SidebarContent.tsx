"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Zap } from "lucide-react"
import type { ActivityItem } from "@/app/chat/types/chat"
import { TimelineActivityLog } from "../activity/TimelineActivityLog"
import { cn } from "@/lib/utils"

interface SidebarContentProps {
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
  isTablet?: boolean
}

export const SidebarContent = ({ activities, onNewChat, onActivityClick, isTablet = false }: SidebarContentProps) => {
  const liveActivities = activities.filter((a) => a.status === "in_progress" || a.status === "pending").length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b border-border/30",
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
        </div>

        <Button
          onClick={onNewChat}
          variant="outline"
          className={cn(
            "w-full justify-start gap-2",
            // Responsive sizing
            isTablet ? "h-8 text-sm" : "h-9",
          )}
        >
          <Plus className={cn(isTablet ? "w-3 h-3" : "w-4 h-4")} />
          New Chat
        </Button>
      </div>

      {/* Live Activity Status */}
      <div className={cn("px-4 py-3 border-b border-border/30 bg-muted/20", isTablet && "px-3 py-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={cn("text-primary", isTablet ? "w-3 h-3" : "w-4 h-4")} />
            <span className={cn("font-medium", isTablet ? "text-xs" : "text-sm")}>Live AI Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className={cn("text-muted-foreground", isTablet ? "text-xs" : "text-sm")}>Real-time</span>
            <Badge variant="secondary" className={cn(isTablet ? "text-xs px-1.5 py-0.5" : "text-xs")}>
              {liveActivities} live
            </Badge>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={cn("p-4", isTablet && "p-3")}>
            <TimelineActivityLog activities={activities} onActivityClick={onActivityClick} isCompact={isTablet} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default SidebarContent
