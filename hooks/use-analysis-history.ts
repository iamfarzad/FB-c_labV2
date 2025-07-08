"use client"

import { useState, useCallback } from "react"

export interface AnalysisEntry {
  id: string
  type: "webcam" | "screen_share" | "video_to_app" | "voice_input"
  timestamp: Date
  input: string
  analysis: string
  metadata?: Record<string, any>
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisEntry[]>([])

  const addEntry = useCallback((entry: Omit<AnalysisEntry, "id" | "timestamp">) => {
    const newEntry: AnalysisEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }

    setHistory((prev) => [newEntry, ...prev])
    return newEntry
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const getEntriesByType = useCallback(
    (type: AnalysisEntry["type"]) => {
      return history.filter((entry) => entry.type === type)
    },
    [history],
  )

  return {
    history,
    addEntry,
    clearHistory,
    getEntriesByType,
  }
}
