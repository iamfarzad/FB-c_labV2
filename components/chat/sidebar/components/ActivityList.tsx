"use client"

import { MessageSquare, Paperclip, PenToolIcon as Tool, Clock, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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

const statusIcons = {
  completed: <CheckCircle className="h-3 w-3 text-green-500" />,
  failed: <AlertCircle className="h-3 w-3 text-red-500" />,
  in_progress: <Loader className="h-3 w-3 text-blue-500 animate-spin" />,
}

const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  } catch {
    return "Now"
  }
}

export function ActivityList({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Clock className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No activity yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Your business activities will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card
          key={activity.id}
          className="p-3 hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
              {iconMap[activity.type as keyof typeof iconMap] || <Tool className="h-4 w-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{activity.title}</h4>
                <div className="flex items-center gap-1">
                  {statusIcons[activity.status as keyof typeof statusIcons]}
                </div>
              </div>

              {activity.details && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{activity.details}</p>
              )}

              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    activity.status === "completed"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : activity.status === "failed"
                        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
                >
                  {activity.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
