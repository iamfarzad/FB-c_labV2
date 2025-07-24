import { getSupabase } from "@/lib/supabase/server"
import type { ActivityItem } from "@/app/chat/types/chat"

interface ServerActivityData {
  type: ActivityItem["type"]
  title: string
  description?: string
  status?: "pending" | "in_progress" | "completed" | "failed"
  metadata?: Record<string, any>
}

/**
 * Server-side activity logging function that integrates with the unified real-time activities system
 * This function logs activities directly to the database, which will be picked up by the real-time subscription
 */
export async function logServerActivity(activityData: ServerActivityData): Promise<string> {
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
      // Check if it's a missing table error
      if (error.message && error.message.includes('relation "public.activities" does not exist')) {
        console.warn("⚠️ Activities table missing - logging to console only")
        console.log("[Server Activity Logged]:", {
          type: activityData.type,
          title: activityData.title,
          description: activityData.description,
          status: activityData.status,
          metadata: activityData.metadata,
          timestamp: new Date().toISOString()
        })
        return `console_fallback_${Date.now()}`
      }
      
      console.error("Failed to log server activity to database:", error.message || error)
      return `fallback_${Date.now()}`
    }

    console.log(`✅ Server activity logged: ${activityData.title} (ID: ${data.id})`)
    return data.id
  } catch (error) {
    console.error("Server activity logging error:", error)
    return `fallback_${Date.now()}`
  }
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use logServerActivity instead
 */
export const logActivity = logServerActivity 