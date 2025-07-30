"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { ActivityItem } from "@/types/chat" // Changed to ActivityItem from Activity
import { CheckCircle2, AlertCircle, Loader } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/time" // Import the new utility

interface ActivityPanelProps {
  activities: ActivityItem[] // Changed to ActivityItem from Activity
}

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  in_progress: <Loader className="h-4 w-4 animate-spin text-blue-500" />,
  failed: <AlertCircle className="h-4 w-4 text-red-500" />,
}

export function ActivityPanel({ activities }: ActivityPanelProps) {
  return (
    <div className="h-full flex flex-col border-l border-border/60 bg-background/80 dark:bg-background/50">
      {" "}
      {/* Adjusted background for better blend */}
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
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>{" "}
                  {/* Use new formatRelativeTime */}
                </div>
                {activity.details && ( // Only show badge if details exist and match type
                  <Badge variant="outline" className="mt-1 font-mono text-xs px-2 py-0.5 rounded-md">
                    {activity.type === "message"
                      ? activity.details.includes("Generated intelligent response")
                        ? "text_generation"
                        : "thinking"
                      : // More specific logic for message types
                        activity.type === "tool_used"
                        ? activity.details.includes("ROI Calculator")
                          ? "roi_calc"
                          : "lead_research"
                        : activity.type === "document_analysis"
                          ? "analysis"
                          : activity.type === "lead_research"
                            ? "lead_research"
                            : activity.type}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
