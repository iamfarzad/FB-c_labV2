import type { Activity } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader, XCircle } from "lucide-react"

const StatusIcon = ({ status }: { status: Activity["status"] }) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-500" />
    case "in_progress":
      return <Loader className="h-3 w-3 text-blue-500 animate-spin" />
    case "failed":
      return <XCircle className="h-3 w-3 text-red-500" />
  }
}

export function ActivityPanel({ activities }: { activities: Activity[] }) {
  return (
    <aside className="hidden md:flex flex-col w-80 bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">AI Activity Panel</h2>
        <p className="text-sm text-muted-foreground">Real-time AI actions</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center shrink-0 mt-1">
                <activity.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <StatusIcon status={activity.status} />
                </div>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <Badge variant="outline">Transparency & Trust</Badge>
      </div>
    </aside>
  )
}
