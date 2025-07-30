"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Activity } from "@/types/chat"

interface ActivityPanelProps {
  activities: Activity[]
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No recent activities.</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                activity.status === "in_progress" &&
                  "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                activity.status === "completed" &&
                  "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
                activity.status === "failed" && "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
              )}
            >
              <div className="shrink-0 mt-1">
                {activity.status === "in_progress" && <activity.icon className="w-4 h-4 text-blue-600 animate-pulse" />}
                {activity.status === "completed" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                {activity.status === "failed" && <XCircle className="w-4 h-4 text-red-600" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-foreground">{activity.title}</div>
                {activity.details && <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs px-2 py-0.5",
                      activity.status === "in_progress" &&
                        "text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
                      activity.status === "completed" &&
                        "text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
                      activity.status === "failed" &&
                        "text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
                    )}
                  >
                    {activity.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
