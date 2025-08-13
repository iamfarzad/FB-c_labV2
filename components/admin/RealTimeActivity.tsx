"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, MessageSquare, User, Zap, Clock, MapPin, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase/client"

interface RealTimeActivityItem {
  id: string
  type: string
  title: string
  description: string
  user?: {
    name: string
    email: string
    location?: string
  }
  timestamp: string
  metadata?: Record<string, any>
}

export function RealTimeActivity() {
  const [activities, setActivities] = useState<RealTimeActivityItem[]>([])
  const [activeUsers, setActiveUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivities()
    subscribeToRealTimeUpdates()
  }, [])

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch("/api/admin/real-time-activity")
      const data = await response.json()
      setActivities(data.activities || [])
      setActiveUsers(data.activeUsers || 0)
    } catch (error) {
      console.error("Failed to fetch real-time activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToRealTimeUpdates = () => {
    const channel = supabase
      .channel("admin-activity-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "lead_summaries" }, (payload) => {
        console.info("New lead activity:", payload)
        // Add new activity to the feed
        const newActivity: RealTimeActivityItem = {
          id: payload.new?.id || Date.now().toString(),
          type: "lead_captured",
          title: "New Lead Captured",
          description: `${payload.new?.name} engaged via ${payload.new?.engagement_type || "chat"}`,
          user: {
            name: payload.new?.name || "Unknown",
            email: payload.new?.email || "",
          },
          timestamp: new Date().toISOString(),
          metadata: payload.new,
        }

        setActivities((prev) => [newActivity, ...prev.slice(0, 49)]) // Keep last 50
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lead_captured":
        return <User className="w-4 h-4 text-green-500" />
      case "ai_interaction":
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case "tool_used":
        return <Zap className="w-4 h-4 text-purple-500" />
      case "error":
        return <Activity className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    const variants = {
      lead_captured: "default",
      ai_interaction: "secondary",
      tool_used: "outline",
      error: "destructive",
    } as const

    return <Badge variant={variants[type as keyof typeof variants] || "secondary"}>{type}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Activity Feed
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </CardTitle>
          <CardDescription>Real-time updates from the F.B/c AI system</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                      <div className="flex items-center space-x-2">
                        {getActivityBadge(activity.type)}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>

                    {activity.user && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {activity.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{activity.user.email}</span>
                        {activity.user.location && (
                          <>
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{activity.user.location}</span>
                          </>
                        )}
                      </div>
                    )}

                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here in real-time</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
