"use client"

import { useState, useCallback } from "react"

export interface AnalysisEntry {
  id: string
  content: string
  type: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface AnalysisResult {
  added: boolean
  reason?: string
  entry?: AnalysisEntry
}

export function useAnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisEntry[]>([])

  const addAnalysis = useCallback(
    (content: string, type = "general", metadata?: Record<string, any>): AnalysisResult => {
      // Check for duplicate content (simple similarity check)
      const isDuplicate = analysisHistory.some((entry) => {
        const similarity = calculateSimilarity(entry.content, content)
        return similarity > 0.8 // 80% similarity threshold
      })

      if (isDuplicate) {
        return {
          added: false,
          reason: "Similar analysis already exists",
        }
      }

      // Check content length
      if (content.trim().length < 10) {
        return {
          added: false,
          reason: "Analysis content too short",
        }
      }

      const newEntry: AnalysisEntry = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: content.trim(),
        type,
        timestamp: new Date(),
        metadata,
      }

      setAnalysisHistory((prev) => [...prev, newEntry])

      return {
        added: true,
        entry: newEntry,
      }
    },
    [analysisHistory],
  )

  const removeAnalysis = useCallback((id: string) => {
    setAnalysisHistory((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setAnalysisHistory([])
  }, [])

  const getAnalysisByType = useCallback(
    (type: string) => {
      return analysisHistory.filter((entry) => entry.type === type)
    },
    [analysisHistory],
  )

  const getRecentAnalysis = useCallback(
    (count = 5) => {
      return analysisHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, count)
    },
    [analysisHistory],
  )

  return {
    analysisHistory: analysisHistory.map((entry) => entry.content), // Backward compatibility
    entries: analysisHistory,
    addAnalysis,
    removeAnalysis,
    clearHistory,
    getAnalysisByType,
    getRecentAnalysis,
  }
}

// Simple similarity calculation using Jaccard similarity
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/))
  const words2 = new Set(str2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter((word) => words2.has(word)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}
