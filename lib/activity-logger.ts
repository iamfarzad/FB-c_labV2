import { supabase } from "@/lib/supabase/client"
import type { ActivityItem } from "@/app/chat/types/chat"

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
}

export const activityLogger = new ActivityLogger()

// A simple server-side logging function if needed, though client-side is primary for this setup
export async function logActivity(activityData: Omit<ActivityItem, "id" | "timestamp">) {
  // This is a placeholder for potential server-side logging if required.
  // For this architecture, we rely on the client-side logger instance.
  console.log(`[Server Activity]: ${activityData.title}`)
}
