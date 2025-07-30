"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "@/types/chat"
import { CheckCircle2, AlertCircle, Loader } from "lucide-react"

interface ActivityPanelProps {
  activities: Activity[]
}

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  in_progress: <Loader className="h-4 w-4 animate-spin text-blue-500" />,
  failed: <AlertCircle className="h-4 w-4 text-red-500" />,
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
  return (
    <div className="h-full flex flex-col border-l border-border/60 bg-background/80">
      <div className="p-4 border-b border-border/60 shrink-0">
        <h2 className="font-semibold text-lg">AI Activity Log</h2>
        <p className="text-sm text-muted-foreground">Real-time operational trace.</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1">{statusIcons[activity.status]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
                <Badge variant="outline" className="mt-1 font-mono text-xs">
                  {activity.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
