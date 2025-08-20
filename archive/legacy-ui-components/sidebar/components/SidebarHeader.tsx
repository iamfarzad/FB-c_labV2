"use client"

import { Button } from "@/components/ui/button"
import { Wrench, Trash2, RefreshCw, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewChatButton } from "./NewChatButton"

interface SidebarHeaderProps {
  activityCount: number
  liveActivityCount: number
  onNewChat: () => void
  onClearActivities?: () => void
  onCleanupStuckActivities?: () => void
  isTablet?: boolean
}

export const SidebarHeader = ({
  activityCount,
  liveActivityCount,
  onNewChat,
  onClearActivities,
  onCleanupStuckActivities,
  isTablet = false,
}: SidebarHeaderProps) => {
  const handleRefresh = async () => {
    try {
      await fetch("/api/cleanup-activities", { method: "POST" })
      window.location.reload()
    } catch (error) {
      console.error("Failed to cleanup activities:", error)
    }
  }

  return (
    <div className={cn("p-4 border-b border-border/20 bg-card/30 backdrop-blur-sm", isTablet && "p-3")}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className={cn("text-primary", isTablet ? "w-4 h-4" : "w-5 h-5")} />
          <h2 className={cn("font-semibold text-foreground", isTablet ? "text-sm" : "text-base")}>Chat History</h2>
        </div>

        <div className="flex items-center gap-1">
          {activityCount > 0 && onCleanupStuckActivities && (
            <Button
              onClick={onCleanupStuckActivities}
              variant="ghost"
              size="sm"
              className={cn("text-muted-foreground hover:text-foreground h-8 px-2 text-xs", isTablet && "h-7")}
              title="Fix stuck activities"
            >
              <Wrench className={cn("mr-1 w-3 h-3")} />
              <span className="hidden sm:inline">Fix</span>
            </Button>
          )}
          {activityCount > 0 && onClearActivities && (
            <Button
              onClick={onClearActivities}
              variant="ghost"
              size="sm"
              className={cn("text-muted-foreground hover:text-foreground h-8 px-2 text-xs", isTablet && "h-7")}
              title="Clear all activities"
            >
              <Trash2 className={cn("mr-1 w-3 h-3")} />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
          {liveActivityCount > 0 && (
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className={cn("text-muted-foreground hover:text-foreground h-8 px-2 text-xs", isTablet && "h-7")}
              title="Refresh activities"
            >
              <RefreshCw className={cn("mr-1 w-3 h-3")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}
        </div>
      </div>

      <NewChatButton onNewChat={onNewChat} isTablet={isTablet} />
    </div>
  )
}
