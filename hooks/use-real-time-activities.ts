"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { ActivityItem } from "@/app/chat/types/chat"

export function useRealTimeActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  const addActivity = useCallback((activity: Omit<ActivityItem, "id" | "timestamp">) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    setActivities((prev) => [newActivity, ...prev.slice(0, 49)]) // Keep last 50
  }, [])

  const updateActivity = useCallback((id: string, updates: Partial<ActivityItem>) => {
    setActivities((prev) => prev.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity)))
  }, [])

  const clearActivities = useCallback(() => {
    setActivities([])
  }, [])

  // Track mount state for hydration safety
  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for real-time activities from Supabase
  useEffect(() => {
    if (!mounted) return

    const channel = supabase.channel("ai-activity")

    channel
      .on("broadcast", { event: "activity-update" }, ({ payload }) => {
        const activity = payload as ActivityItem
        setActivities((prev) => {
          // Check if activity already exists (update) or is new
          const existingIndex = prev.findIndex((a) => a.id === activity.id)
          if (existingIndex >= 0) {
            // Update existing
            const updated = [...prev]
            updated[existingIndex] = activity
            return updated
          } else {
            // Add new
            return [activity, ...prev.slice(0, 49)]
          }
        })
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mounted])

  // Listen for browser events (for client-side activities)
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return

    const handleActivity = (event: CustomEvent) => {
      const activity = event.detail as ActivityItem
      setActivities((prev) => {
        const existingIndex = prev.findIndex((a) => a.id === activity.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = activity
          return updated
        } else {
          return [activity, ...prev.slice(0, 49)]
        }
      })
    }

    window.addEventListener("ai-activity", handleActivity as EventListener)
    return () => window.removeEventListener("ai-activity", handleActivity as EventListener)
  }, [mounted])

  return {
    activities,
    isConnected,
    addActivity,
    updateActivity,
    clearActivities,
  }
}
