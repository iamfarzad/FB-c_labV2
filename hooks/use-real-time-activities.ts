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
    setActivities((prev) => {
      // Add new activity and keep only last 15 activities to prevent performance issues
      const updated = [newActivity, ...prev]
      
      // Remove old completed activities (older than 2 minutes) to keep the list manageable
      const twoMinutesAgo = Date.now() - (2 * 60 * 1000)
      const filtered = updated.filter(activity => 
        activity.status !== 'completed' || activity.timestamp > twoMinutesAgo
      )
      
      // Keep only last 15 activities maximum
      return filtered.slice(0, 15)
    })
  }, [])

  const updateActivity = useCallback((id: string, updates: Partial<ActivityItem>) => {
    setActivities((prev) => prev.map((activity) => (activity.id === id ? { ...activity, ...updates } : activity)))
  }, [])

  const clearActivities = useCallback(() => {
    setActivities([])
  }, [])

  // Cleanup old activities periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setActivities((prev) => {
        // Remove completed activities older than 2 minutes for more aggressive cleanup
        const twoMinutesAgo = Date.now() - (2 * 60 * 1000)
        const filtered = prev.filter(activity => 
          activity.status !== 'completed' || activity.timestamp > twoMinutesAgo
        )
        
        // Keep only last 15 activities maximum
        return filtered.slice(0, 15)
      })
    }, 15000) // Run every 15 seconds for more frequent cleanup

    return () => clearInterval(cleanupInterval)
  }, [])

  // Track mount state for hydration safety and load existing activities
  useEffect(() => {
    setMounted(true)
    
    // Load existing activities from the database
    const loadExistingActivities = async () => {
      try {
        if (!supabase) return
        
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15) // Reduced from 50 to 15 for better performance
        
        if (error) {
          console.error('Failed to load existing activities:', error)
          return
        }
        
        if (data) {
          const formattedActivities = data.map((item: any) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            status: item.status,
            timestamp: new Date(item.created_at).getTime(),
            metadata: item.metadata || {}
          })) as ActivityItem[]
          
          setActivities(formattedActivities)
        }
      } catch (error) {
        console.error('Error loading existing activities:', error)
      }
    }
    
    loadExistingActivities()
  }, [])

  // Listen for real-time activities from Supabase
  useEffect(() => {
    if (!mounted) return

    // Check if supabase is properly initialized
    if (!supabase || typeof supabase.channel !== 'function') {
      console.warn('Supabase client not properly initialized, skipping real-time subscription')
      setIsConnected(false)
      return
    }

    // Check if we have valid environment variables
    const hasValidConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!hasValidConfig) {
      console.warn('Missing Supabase configuration, skipping real-time subscription')
      setIsConnected(false)
      return
    }

    try {
      // Subscribe to the activities table for real-time updates
      const channel = supabase
        .channel('activities-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities'
          },
          (payload: any) => {
            console.log('Received real-time activity:', payload)
            const activity = {
              id: payload.new.id,
              type: payload.new.type,
              title: payload.new.title,
              description: payload.new.description,
              status: payload.new.status,
              timestamp: new Date(payload.new.created_at).getTime(),
              metadata: payload.new.metadata || {}
            } as ActivityItem
            
            setActivities((prev) => {
              // Check if activity already exists (update) or is new
              const existingIndex = prev.findIndex((a) => a.id === activity.id)
              if (existingIndex >= 0) {
                // Update existing
                const updated = [...prev]
                updated[existingIndex] = activity
                return updated
              } else {
                // Add new and keep only last 15 activities for performance
                const updated = [activity, ...prev]
                
                // Remove old completed activities (older than 3 minutes)
                const threeMinutesAgo = Date.now() - (3 * 60 * 1000)
                const filtered = updated.filter(activity => 
                  activity.status !== 'completed' || activity.timestamp > threeMinutesAgo
                )
                
                // Keep only last 15 activities maximum
                return filtered.slice(0, 15)
              }
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'activities'
          },
          (payload: any) => {
            console.log('Activity updated:', payload)
            const activity = {
              id: payload.new.id,
              type: payload.new.type,
              title: payload.new.title,
              description: payload.new.description,
              status: payload.new.status,
              timestamp: new Date(payload.new.created_at).getTime(),
              metadata: payload.new.metadata || {}
            } as ActivityItem
            
            setActivities((prev) => 
              prev.map((a) => (a.id === activity.id ? activity : a))
            )
          }
        )
        .subscribe((status: any) => {
          console.log('Real-time subscription status:', status)
          setIsConnected(status === "SUBSCRIBED")
        })

      return () => {
        if (supabase && typeof supabase.removeChannel === 'function') {
          supabase.removeChannel(channel)
        }
      }
    } catch (error) {
      console.error('Error setting up Supabase real-time subscription:', error)
      setIsConnected(false)
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
          // Add new and keep only last 15 activities for performance
          const updated = [activity, ...prev]
          
          // Remove old completed activities (older than 3 minutes)
          const threeMinutesAgo = Date.now() - (3 * 60 * 1000)
          const filtered = updated.filter(activity => 
            activity.status !== 'completed' || activity.timestamp > threeMinutesAgo
          )
          
          // Keep only last 15 activities maximum
          return filtered.slice(0, 15)
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
