"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import type { ActivityItem } from "@/app/chat/types/chat"
import { ActivityIcon } from "../sidebar/ActivityIcon"

interface TimelineActivityLogProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
  isCompact?: boolean
}

export function TimelineActivityLog({ activities, onActivityClick, isCompact = false }: TimelineActivityLogProps) {
  // Limit activities to prevent performance issues - show only last 20 activities
  const limitedActivities = activities.slice(-20)
  
  const getStatusIcon = (status: ActivityItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />
      case "in_progress":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      default:
        return <Clock className="w-3 h-3 text-gray-400" />
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (limitedActivities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <p className="text-sm">No activities yet</p>
        <p className="text-xs mt-1">AI actions will appear here in real-time</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3">
        {limitedActivities.map((activity, index) => (
          <div
            key={activity.id}
            className={`relative flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer ${
              isCompact ? "text-xs" : "text-sm"
            }`}
            onClick={() => onActivityClick?.(activity)}
          >
            {/* Timeline line */}
            {index < activities.length - 1 && <div className="absolute left-6 top-12 w-px h-6 bg-border" />}

            {/* Activity icon */}
            <div className="flex-shrink-0">
              <ActivityIcon type={activity.type} className={isCompact ? "w-4 h-4" : "w-5 h-5"} />
            </div>

            {/* Activity content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className={`font-medium truncate ${isCompact ? "text-xs" : "text-sm"}`}>{activity.title}</h4>
                <div className="flex items-center gap-1">
                  {getStatusIcon(activity.status)}
                  <span className={`text-muted-foreground ${isCompact ? "text-xs" : "text-xs"}`}>
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>

              <p className={`text-muted-foreground mb-2 ${isCompact ? "text-xs" : "text-sm"}`}>
                {activity.description}
              </p>

              {/* Status badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    activity.status === "completed"
                      ? "default"
                      : activity.status === "failed"
                        ? "destructive"
                        : activity.status === "in_progress"
                          ? "secondary"
                          : "outline"
                  }
                  className={isCompact ? "text-xs px-1.5 py-0.5" : "text-xs"}
                >
                  {activity.status}
                </Badge>

                {activity.duration && (
                  <span className={`text-muted-foreground ${isCompact ? "text-xs" : "text-xs"}`}>
                    {activity.duration}ms
                  </span>
                )}
              </div>

              {/* Details */}
              {activity.details && activity.details.length > 0 && (
                <div className="mt-2 space-y-1">
                  {activity.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`text-muted-foreground bg-muted/30 px-2 py-1 rounded ${
                        isCompact ? "text-xs" : "text-xs"
                      }`}
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
