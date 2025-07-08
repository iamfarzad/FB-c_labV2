"use client"

import { useChatContext } from "@/app/chat/context/ChatProvider"
import { ActivityIcon } from "../sidebar/ActivityIcon"
import { formatDistanceToNow } from "date-fns"

export function TimelineActivityLog() {
  const { activities } = useChatContext()

  if (!activities || activities.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">No activities yet</p>
        <p className="text-xs mt-1">AI actions will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <ActivityIcon type={activity.type} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
            {activity.metadata && (
              <div className="text-xs text-muted-foreground mt-1 opacity-75">{JSON.stringify(activity.metadata)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
