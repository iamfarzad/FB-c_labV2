"use client"

import { MessageSquare, Paperclip, PenToolIcon as Tool, Clock } from "lucide-react"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"

const iconMap = {
  message: <MessageSquare className="h-4 w-4" />,
  tool_used: <Tool className="h-4 w-4" />,
  file_upload: <Paperclip className="h-4 w-4" />,
  lead_research: <Tool className="h-4 w-4" />,
  roi_calculation: <Tool className="h-4 w-4" />,
  document_analysis: <Tool className="h-4 w-4" />,
  meeting_scheduled: <Tool className="h-4 w-4" />,
}

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch {
    return "Now"
  }
}

export function ActivityList({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        No activity yet.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="text-muted-foreground mt-0.5">
            {iconMap[activity.type as keyof typeof iconMap] || <Tool className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{activity.title}</div>
            {activity.details && <div className="text-xs text-muted-foreground truncate">{activity.details}</div>}
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activity.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : activity.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {activity.status}
              </span>
              <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
