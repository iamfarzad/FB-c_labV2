"use client"

import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { MessageSquare, Paperclip, PenToolIcon as Tool } from "lucide-react"

const iconMap = {
  message: <MessageSquare className="h-4 w-4" />,
  tool_used: <Tool className="h-4 w-4" />,
  file_upload: <Paperclip className="h-4 w-4" />,
}

export function ActivityList({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return <div className="text-center text-sm text-muted-foreground">No activity yet.</div>
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center text-sm">
          <div className="mr-2 text-muted-foreground">{iconMap[activity.type]}</div>
          <div className="flex-1 truncate">{activity.description}</div>
          <div className="ml-2 text-xs text-muted-foreground">{activity.timestamp}</div>
        </div>
      ))}
    </div>
  )
}
