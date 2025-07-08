"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Activity, AlertCircle, CheckCircle, Clock, Loader2, X } from "lucide-react"
import { useRealTimeActivities } from "@/hooks/use-real-time-activities"
import { ActivityIcon } from "../sidebar/ActivityIcon"
import type { ActivityItem } from "@/app/chat/types/chat"

export function TimelineActivityLog() {
  const { activities, isConnected, clearActivities } = useRealTimeActivities()
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getStatusIcon = (status: ActivityItem["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3 text-yellow-500" />
      case "in_progress":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />
      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return <Activity className="w-3 h-3 text-gray-500" />
    }
  }

  const getStatusBadge = (status: ActivityItem["status"]) => {
    const variants = {
      pending: "secondary",
      in_progress: "default",
      completed: "default",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            AI Activity Timeline
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {activities.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearActivities} className="text-xs">
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{isConnected ? "Live updates enabled" : "Connecting..."}</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={isExpanded ? "h-96" : "h-48"}>
          <div className="p-4 space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs">AI actions will appear here in real-time</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <ActivityIcon type={activity.type} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">{activity.description}</p>

                    <div className="flex items-center justify-between">
                      {getStatusBadge(activity.status)}
                      {activity.duration && (
                        <span className="text-xs text-muted-foreground">{activity.duration}ms</span>
                      )}
                    </div>

                    {activity.details && activity.details.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {activity.details.map((detail, index) => (
                          <p key={index} className="text-xs text-muted-foreground">
                            • {detail}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
