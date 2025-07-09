import { supabase } from "@/lib/supabase/client"
import type { ActivityItem } from "@/app/chat/types/chat"

class ActivityLogger {
  private sessionId: string | null = null

  setSessionId(sessionId: string) {
    this.sessionId = sessionId
  }

  async log(activity: Omit<ActivityItem, "id" | "timestamp">) {
    const activityItem: ActivityItem = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    // Broadcast to real-time channel
    if (this.sessionId) {
      await supabase.channel(`activity-log-${this.sessionId}`).send({
        type: "broadcast",
        event: "activity-update",
        payload: activityItem,
      })
    }

    // Store in database for persistence
    try {
      await supabase.from("ai_interactions").insert({
        session_id: this.sessionId || "unknown",
        interaction_type: activity.type,
        user_input: activity.title,
        ai_response: activity.description,
        metadata: {
          status: activity.status,
          duration: activity.duration,
          details: activity.details,
        },
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to log activity to database:", error)
    }

    return activityItem
  }
}

export const activityLogger = new ActivityLogger()
