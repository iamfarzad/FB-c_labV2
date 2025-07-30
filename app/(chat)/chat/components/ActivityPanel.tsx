"use client"

import { useChatContext } from "../context/ChatProvider"
import { formatRelativeTime } from "@/lib/utils/time"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ActivityPanel() {
  const { activities } = useChatContext()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-slate-700 bg-slate-900 p-4 text-slate-50">
      <h2 className="mb-4 text-lg font-semibold">AI Activity Log</h2>
      <p className="mb-4 text-sm text-slate-400">Real-time operational trace.</p>
      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1 shrink-0">{getStatusIcon(activity.status)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{activity.title}</span>
                  <span className="text-xs text-slate-400">{formatRelativeTime(activity.timestamp)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {activity.type.replace(/_/g, " ")}
                  </Badge>
                  {activity.details && <span className="text-xs text-slate-400">{activity.details}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
