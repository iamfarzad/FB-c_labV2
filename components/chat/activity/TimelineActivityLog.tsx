"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/app/chat/types/chat"
import { ActivityIcon } from "../sidebar/ActivityIcon"
import { motion, AnimatePresence } from "framer-motion"

interface TimelineActivityLogProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
  className?: string
  isCompact?: boolean
}

export function TimelineActivityLog({
  activities,
  onActivityClick,
  className,
  isCompact = false,
}: TimelineActivityLogProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpanded = (activityId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }))
  }

  const getStatusIcon = (status: ActivityItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className={cn("text-green-500", isCompact ? "w-3 h-3" : "w-4 h-4")} />
      case "failed":
        return <XCircle className={cn("text-red-500", isCompact ? "w-3 h-3" : "w-4 h-4")} />
      case "in_progress":
      case "pending":
        return <Loader2 className={cn("text-blue-500 animate-spin", isCompact ? "w-3 h-3" : "w-4 h-4")} />
      default:
        return <Clock className={cn("text-muted-foreground", isCompact ? "w-3 h-3" : "w-4 h-4")} />
    }
  }

  const getStatusColor = (status: ActivityItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700 dark:text-green-300"
      case "failed":
        return "bg-red-500/20 text-red-700 dark:text-red-300"
      case "in_progress":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 animate-pulse"
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (activities.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", isCompact && "py-4", className)}>
        <div className={cn("mb-2", isCompact ? "text-xs" : "text-sm")}>No activities yet</div>
        <div className={cn("text-muted-foreground/70", isCompact ? "text-xs" : "text-xs")}>
          Start a conversation to see AI activities
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence>
        {activities.map((activity, index) => {
          const isExpanded = expandedItems[activity.id] || false
          const hasDetails = activity.details && activity.details.length > 0
          const isLive = activity.status === "in_progress" || activity.status === "pending"

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "transition-all duration-200 hover:shadow-sm border-l-4",
                  isLive && "border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20",
                  activity.status === "completed" && "border-l-green-500",
                  activity.status === "failed" && "border-l-red-500",
                  activity.status === "pending" && "border-l-yellow-500",
                  isCompact && "border-l-2",
                )}
              >
                <CardContent className={cn("p-3", isCompact && "p-2")}>
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => onActivityClick?.(activity)}>
                    {/* Activity Icon */}
                    <div className={cn("flex-shrink-0 mt-0.5", isCompact && "mt-0")}>
                      <ActivityIcon type={activity.type} className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className={cn("font-medium text-foreground truncate", isCompact ? "text-xs" : "text-sm")}>
                            {activity.title}
                          </h4>
                          <p
                            className={cn(
                              "text-muted-foreground mt-0.5 line-clamp-2",
                              isCompact ? "text-xs" : "text-xs",
                            )}
                          >
                            {activity.description}
                          </p>
                        </div>

                        {/* Status and Timestamp */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(activity.status)}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs px-1.5 py-0.5",
                                getStatusColor(activity.status),
                                isCompact && "text-xs px-1 py-0",
                              )}
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          {activity.timestamp && (
                            <span className={cn("text-muted-foreground", isCompact ? "text-xs" : "text-xs")}>
                              {new Date(activity.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {hasDetails && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpanded(activity.id)
                            }}
                            className={cn(
                              "h-6 px-2 text-xs text-muted-foreground hover:text-foreground",
                              isCompact && "h-5 px-1 text-xs",
                            )}
                          >
                            {isExpanded ? (
                              <ChevronDown className={cn("mr-1", isCompact ? "w-3 h-3" : "w-3 h-3")} />
                            ) : (
                              <ChevronRight className={cn("mr-1", isCompact ? "w-3 h-3" : "w-3 h-3")} />
                            )}
                            Details
                          </Button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div
                                  className={cn(
                                    "mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground space-y-1",
                                    isCompact && "p-1.5 text-xs",
                                  )}
                                >
                                  {activity.details?.map((detail, idx) => (
                                    <div key={idx} className="flex items-start gap-1">
                                      <span className="text-muted-foreground/50">•</span>
                                      <span className="flex-1">{detail}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default TimelineActivityLog
