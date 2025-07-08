"use client"

import { Clock, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react"
import { ActivityIcon } from "../sidebar/ActivityIcon"
import type { Activity } from "@/app/chat/context/ChatProvider"

interface TimelineActivityLogProps {
  activities: Activity[]
}

export function TimelineActivityLog({ activities }: TimelineActivityLogProps) {
  const getStatusIcon = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "in_progress":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No activities yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={activity.id || index}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-shrink-0 mt-1">
            <ActivityIcon type={activity.type} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium truncate">{activity.title}</h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusIcon(activity.status)}
                <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
              </div>
            </div>

            {activity.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{activity.description}</p>
            )}

            {activity.details && activity.details.length > 0 && (
              <div className="space-y-1">
                {activity.details.map((detail, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1">
                    {detail}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
