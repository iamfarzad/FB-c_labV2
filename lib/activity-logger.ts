import { supabase } from "@/lib/supabase/client"
import { getSupabase } from "@/lib/supabase/server"
import type { ActivityItem } from "@/app/chat/types/chat"

interface ServerActivityData {
  type: string
  title: string
  description?: string
  status?: "pending" | "in_progress" | "completed" | "failed"
  metadata?: Record<string, any>
}

class ActivityLogger {
  private channel: any = null

  constructor() {
    this.initializeChannel()
  }

  private initializeChannel() {
    try {
      // Ensure this runs only on the client
      if (typeof window !== "undefined") {
        this.channel = supabase.channel(`activity-log-${Date.now()}`)
        this.channel.subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            console.log("Activity logger connected to Supabase channel.")
          }
        })
      }
    } catch (error) {
      console.warn("Failed to initialize activity logger channel:", error)
    }
  }

  log(activityData: Omit<ActivityItem, "id" | "timestamp">): string {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newActivity: ActivityItem = {
      ...activityData,
      id,
      timestamp: Date.now(),
    }

    // Broadcast the activity to all clients
    if (this.channel) {
      this.channel.send({
        type: "broadcast",
        event: "activity-update",
        payload: newActivity,
      })
    } else {
      // Fallback for server-side or if channel is not ready
      console.log("[Activity Logged]:", newActivity.title)
    }

    return id
  }

  // Server-side activity logging with database persistence
  async logToDatabase(activityData: ServerActivityData): Promise<string> {
    try {
      const serverSupabase = getSupabase()
      
      const { data, error } = await serverSupabase
        .from("activities")
        .insert({
          type: activityData.type,
          title: activityData.title,
          description: activityData.description || null,
          status: activityData.status || "completed",
          metadata: activityData.metadata || {}
        })
        .select("id")
        .single()

      if (error) {
        console.error("Failed to log activity to database:", error.message || error)
        // Don't throw error, just log it
        return `fallback_${Date.now()}`
      }

      return data.id
    } catch (error) {
      console.error("Activity logging error:", error)
      return `fallback_${Date.now()}`
    }
  }
}

export const activityLogger = new ActivityLogger()

// Server-side logging function for API routes
export async function logActivity(activityData: ServerActivityData): Promise<string> {
  try {
    const serverSupabase = getSupabase()
    
    const { data, error } = await serverSupabase
      .from("activities")
      .insert({
        type: activityData.type,
        title: activityData.title,
        description: activityData.description || null,
        status: activityData.status || "completed",
        metadata: activityData.metadata || {}
      })
      .select("id")
      .single()

    if (error) {
      console.error("Failed to log activity to database:", error.message || error)
      return `fallback_${Date.now()}`
    }

    return data.id
  } catch (error) {
    console.error("Activity logging error:", error)
    return `fallback_${Date.now()}`
  }
}
