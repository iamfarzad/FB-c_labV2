import { supabase } from "@/lib/supabase/client"

export interface ActivityLog {
  id: string
  type: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed"
  timestamp: string
  duration?: number
  details?: string[]
  metadata?: Record<string, any>
}

class ActivityLogger {
  private activities: Map<string, ActivityLog> = new Map()
  private channel: any = null

  constructor() {
    this.initializeChannel()
  }

  private initializeChannel() {
    try {
      this.channel = supabase.channel("activity-logger")
      this.channel.subscribe()
    } catch (error) {
      console.warn("Failed to initialize activity logger channel:", error)
    }
  }

  startActivity(type: string, data: Partial<ActivityLog>): string {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const activity: ActivityLog = {
      id,
      type,
      title: data.title || `${type} started`,
      description: data.description || "",
      status: "in_progress",
      timestamp: new Date().toISOString(),
      details: data.details || [],
      metadata: data.metadata || {},
    }

    this.activities.set(id, activity)
    this.broadcastActivity(activity)

    return id
  }

  completeActivity(id: string, updates: Partial<ActivityLog>): void {
    const activity = this.activities.get(id)
    if (!activity) return

    const startTime = new Date(activity.timestamp).getTime()
    const endTime = Date.now()

    const updatedActivity: ActivityLog = {
      ...activity,
      ...updates,
      status: updates.status || "completed",
      duration: endTime - startTime,
    }

    this.activities.set(id, updatedActivity)
    this.broadcastActivity(updatedActivity)
  }

  logActivity(data: Partial<ActivityLog>): string {
    const id = this.startActivity(data.type || "generic", data)

    // Immediately complete if status is provided
    if (data.status && data.status !== "in_progress") {
      this.completeActivity(id, { status: data.status })
    }

    return id
  }

  private broadcastActivity(activity: ActivityLog): void {
    try {
      if (this.channel) {
        this.channel.send({
          type: "broadcast",
          event: "activity-update",
          payload: activity,
        })
      }
    } catch (error) {
      console.warn("Failed to broadcast activity:", error)
    }
  }

  getActivity(id: string): ActivityLog | undefined {
    return this.activities.get(id)
  }

  getAllActivities(): ActivityLog[] {
    return Array.from(this.activities.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  }

  clearActivities(): void {
    this.activities.clear()
  }
}

// Export singleton instance
export const activityLogger = new ActivityLogger()

// Helper function for API routes
export async function logActivity(data: {
  type: string
  description: string
  metadata?: Record<string, any>
  sessionId?: string
}): Promise<void> {
  try {
    console.log("Activity logged:", data)
    // In a real implementation, this would save to database
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}
