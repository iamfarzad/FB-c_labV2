import type { ActivityItem } from "@/app/chat/types/chat"

class ActivityLogger {
  private activities: Map<string, ActivityItem> = new Map()
  private listeners: ((activity: ActivityItem) => void)[] = []

  addListener(callback: (activity: ActivityItem) => void) {
    this.listeners.push(callback)
  }

  removeListener(callback: (activity: ActivityItem) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  private notifyListeners(activity: ActivityItem) {
    this.listeners.forEach((listener) => {
      try {
        listener(activity)
      } catch (error) {
        console.error("Error in activity listener:", error)
      }
    })
  }

  logActivity(activity: Omit<ActivityItem, "id" | "timestamp">): string {
    const id = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullActivity: ActivityItem = {
      ...activity,
      id,
      timestamp: Date.now(),
    }

    this.activities.set(id, fullActivity)
    this.notifyListeners(fullActivity)

    console.log(`[Activity] ${activity.title}:`, activity.description)

    return id
  }

  startActivity(
    type: ActivityItem["type"],
    activity: Omit<ActivityItem, "id" | "timestamp" | "type" | "status">,
  ): string {
    return this.logActivity({
      ...activity,
      type,
      status: "in_progress",
    })
  }

  completeActivity(id: string, updates: Partial<Pick<ActivityItem, "title" | "description" | "details" | "metadata">>) {
    const activity = this.activities.get(id)
    if (activity) {
      const updatedActivity: ActivityItem = {
        ...activity,
        ...updates,
        status: "completed",
        timestamp: Date.now(),
      }
      this.activities.set(id, updatedActivity)
      this.notifyListeners(updatedActivity)
    }
  }

  failActivity(id: string, error: string, details?: string[]) {
    const activity = this.activities.get(id)
    if (activity) {
      const updatedActivity: ActivityItem = {
        ...activity,
        status: "failed",
        description: error,
        details: details || activity.details,
        timestamp: Date.now(),
      }
      this.activities.set(id, updatedActivity)
      this.notifyListeners(updatedActivity)
    }
  }

  getActivity(id: string): ActivityItem | undefined {
    return this.activities.get(id)
  }

  getAllActivities(): ActivityItem[] {
    return Array.from(this.activities.values()).sort((a, b) => b.timestamp - a.timestamp)
  }

  clearActivities() {
    this.activities.clear()
    console.log("[Activity] All activities cleared")
  }

  getActivitiesByType(type: ActivityItem["type"]): ActivityItem[] {
    return this.getAllActivities().filter((activity) => activity.type === type)
  }

  getActivitiesByStatus(status: ActivityItem["status"]): ActivityItem[] {
    return this.getAllActivities().filter((activity) => activity.status === status)
  }
}

export const activityLogger = new ActivityLogger()

// Named export for compatibility
export function logActivity(activity: Omit<ActivityItem, "id" | "timestamp">): string {
  return activityLogger.logActivity(activity)
}
