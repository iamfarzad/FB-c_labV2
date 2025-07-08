"use client"

import { useState, useCallback } from "react"

export function useAnalysisHistory() {
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([])

  const addAnalysis = useCallback((analysis: string) => {
    setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 9)]) // Keep last 10
  }, [])

  const clearHistory = useCallback(() => {
    setAnalysisHistory([])
  }, [])

  return {
    analysisHistory,
    addAnalysis,
    clearHistory,
  }
}
