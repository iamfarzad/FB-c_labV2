import { getSupabase } from "@/lib/supabase/server"

export interface ActivityLog {
  type: string
  title: string
  description?: string
  status: "in_progress" | "completed" | "failed"
  metadata?: Record<string, any>
  timestamp?: string
}

class ActivityLogger {
  private supabase = getSupabase()

  async log(activity: ActivityLog) {
    try {
      const { error } = await this.supabase.from("activity_logs").insert({
        type: activity.type,
        title: activity.title,
        description: activity.description || null,
        status: activity.status,
        metadata: activity.metadata || null,
        timestamp: activity.timestamp || new Date().toISOString(),
      })

      if (error) {
        console.error("Failed to log activity:", error)
      }

      // Also broadcast to real-time channel for live updates
      await this.supabase.channel("activity_updates").send({
        type: "broadcast",
        event: "activity_logged",
        payload: activity,
      })
    } catch (error) {
      console.error("Activity logging error:", error)
    }
  }

  async getRecentActivities(limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from("activity_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Failed to fetch activities:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      return []
    }
  }

  async getActivitiesByType(type: string, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from("activity_logs")
        .select("*")
        .eq("type", type)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Failed to fetch activities by type:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Failed to fetch activities by type:", error)
      return []
    }
  }
}

export const activityLogger = new ActivityLogger()
