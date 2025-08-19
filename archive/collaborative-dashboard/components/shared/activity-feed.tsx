"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { useActivity } from "@/contexts/app-context"

export function ActivityFeed() {
  const { activities } = useActivity()

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)

    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  const getFeatureColor = (feature: string) => {
    switch (feature) {
      case "chat":
        return "bg-blue-100 text-blue-700"
      case "canvas":
        return "bg-purple-100 text-purple-700"
      case "webcam":
        return "bg-green-100 text-green-700"
      case "screenshare":
        return "bg-orange-100 text-orange-700"
      case "workshop":
        return "bg-emerald-100 text-emerald-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-emerald-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activities.slice(0, 20).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-emerald-700">{activity.userName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{activity.userName}</span> {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={`text-xs ${getFeatureColor(activity.feature)}`}>
                        {activity.feature}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatTime(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
