"use client"

import type React from "react"
import { useState, useMemo } from "react"
import {
  MessageSquare,
  Bot,
  Search,
  Brain,
  Upload,
  FileText,
  ImageIcon,
  Mic,
  Monitor,
  Mail,
  Activity,
  Link,
  Eye,
  Database,
  CheckCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"

interface VerticalProcessChainProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
  className?: string
}

interface ProcessNodeProps {
  activity: ActivityItem
  index: number
  isLatest: boolean
  onHover: (activity: ActivityItem) => void
  onLeave: () => void
}

const ProcessNode = ({ activity, index, isLatest, onHover, onLeave }: ProcessNodeProps) => {
  const getNodeStyle = (status: ActivityItem["status"]) => {
    const baseClasses =
      "relative flex items-center justify-center rounded-full border transition-all duration-300 ease-out"

    const statusStyles = {
      in_progress: "w-6 h-6 bg-white border-2 border-muted-foreground/60 shadow-lg animate-pulse",
      completed: "w-4 h-4 bg-muted-foreground/40 border border-muted-foreground/30",
      failed: "w-4 h-4 bg-muted-foreground/30 border border-muted-foreground/20 opacity-40", // Less alarming
      pending: "w-3 h-3 bg-muted-foreground/30 border border-muted-foreground/20 opacity-40",
    }

    return cn(baseClasses, statusStyles[status] || statusStyles.pending)
  }

  const getIcon = (type: ActivityItem["type"]) => {
    const iconMap: Partial<Record<ActivityItem["type"], React.ElementType>> = {
      user_action: MessageSquare,
      ai_thinking: Brain,
      ai_stream: Bot,
      ai_request: Bot,
      google_search: Search,
      search: Search,
      doc_analysis: FileText,
      file_upload: Upload,
      image_upload: ImageIcon,
      voice_input: Mic,
      voice_response: Mic,
      screen_share: Monitor,
      email_sent: Mail,
      error: Activity,
      web_scrape: Link,
      link: Link,
      vision_analysis: Eye,
      database: Database,
      complete: CheckCircle,
      analyze: Brain,
      generate: Brain,
      processing: Brain,
      tool_used: Zap,
    }

    const IconComponent = iconMap[type] || Activity
    const iconSize = activity.status === "in_progress" ? "w-3 h-3" : "w-2 h-2"
    const iconColor = activity.status === "in_progress" ? "text-foreground" : "text-muted-foreground"

    return <IconComponent className={cn(iconSize, iconColor)} />
  }

  return (
    <div
      className="relative flex items-center group mb-3"
      onMouseEnter={() => onHover(activity)}
      onMouseLeave={onLeave}
    >
      {/* Connection line to next node */}
      {!isLatest && (
        <div
          className="absolute left-1/2 top-full w-px bg-muted-foreground/30 -translate-x-px h-3"
        />
      )}

      {/* Node */}
      <div className={getNodeStyle(activity.status)}>
        {activity.status !== "pending" && getIcon(activity.type)}

        {/* Active indicator */}
        {activity.status === "in_progress" && (
          <div className="absolute inset-0 rounded-full border border-muted-foreground/40 animate-ping" />
        )}
      </div>
    </div>
  )
}

export function VerticalProcessChain({ activities, onActivityClick, className }: VerticalProcessChainProps) {
  const [hoveredActivity, setHoveredActivity] = useState<ActivityItem | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  // Get the last 8 activities for the chain
  const chainActivities = useMemo(() => {
    return activities.slice(-8)
  }, [activities])

  const hasActiveProcess = chainActivities.some((a) => a.status === "in_progress")

  if (chainActivities.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-muted-foreground", className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm">No activities yet</p>
        <p className="text-xs mt-1">AI actions will appear here in real-time</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Main chain container */}
      <div className="relative">
        {/* Background indicator */}
        {hasActiveProcess && (
          <div className="absolute -left-1 -right-1 -top-2 -bottom-2 bg-muted/5 rounded-full animate-pulse" />
        )}

        {/* Chain nodes */}
        <div className="relative flex flex-col items-center py-4">
          {chainActivities.map((activity, index) => (
            <ProcessNode
              key={activity.id}
              activity={activity}
              index={index}
              isLatest={index === chainActivities.length - 1}
              onHover={(activity) => {
                setHoveredActivity(activity)
                setShowTooltip(true)
              }}
              onLeave={() => {
                setShowTooltip(false)
                setTimeout(() => setHoveredActivity(null), 200)
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating tooltip */}
      {showTooltip && hoveredActivity && (
        <div className="absolute left-12 top-1/2 transform -translate-y-1/2 bg-popover/95 backdrop-blur-sm text-popover-foreground px-3 py-2 rounded-md shadow-xl border border-border pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
          <div className="text-sm font-medium">{hoveredActivity.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{hoveredActivity.description}</div>
          <div className="flex justify-between items-center text-xs mt-2">
            <span
              className={cn("px-2 py-0.5 rounded text-xs", {
                "bg-muted text-muted-foreground": hoveredActivity.status === "completed",
                "bg-accent/20 text-accent-foreground": hoveredActivity.status === "in_progress",
                "bg-destructive/20 text-destructive": hoveredActivity.status === "failed",
                "bg-muted/30 text-muted-foreground": hoveredActivity.status === "pending",
              })}
            >
              {hoveredActivity.status.replace("_", " ")}
            </span>
          </div>

          {/* Tooltip arrow */}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-popover/95" />
        </div>
      )}
    </div>
  )
}
