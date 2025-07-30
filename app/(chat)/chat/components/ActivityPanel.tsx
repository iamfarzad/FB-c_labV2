"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader } from "lucide-react"
import type { Activity } from "../types/chat"
import { cn } from "@/lib/utils"

interface ActivityPanelProps {
  activities: Activity[]
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
  const getStatusIcon = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <aside className="w-80 border-l bg-background/80 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Activity Log</h2>
        <p className="text-sm text-muted-foreground">A real-time log of AI activities.</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-10">No activities yet.</div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-1">{getStatusIcon(activity.status)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs mt-1",
                      activity.status === "completed" && "border-green-200 dark:border-green-800 text-green-600",
                      activity.status === "failed" && "border-red-200 dark:border-red-800 text-red-600",
                      activity.status === "in_progress" && "border-blue-200 dark:border-blue-800 text-blue-600",
                    )}
                  >
                    {activity.type.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
