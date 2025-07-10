"use client"

import { useState, useCallback, useRef } from "react"

interface AnalysisEntry {
  id: string
  content: string
  timestamp: number
  type?: string
  similarity?: number
}

interface UseAnalysisHistoryOptions {
  maxEntries?: number
  similarityThreshold?: number
  minTimeInterval?: number // milliseconds
  enableDeduplication?: boolean
}

export function useAnalysisHistory(options: UseAnalysisHistoryOptions = {}) {
  const {
    maxEntries = 50,
    similarityThreshold = 0.8,
    minTimeInterval = 5000, // 5 seconds
    enableDeduplication = true
  } = options

  const [analysisHistory, setAnalysisHistory] = useState<AnalysisEntry[]>([])
  const lastAnalysisTime = useRef<number>(0)

  // Calculate similarity between two strings using Jaccard similarity
  const calculateSimilarity = useCallback((str1: string, str2: string): number => {
    if (!str1 || !str2) return 0
    
    // Normalize strings
    const normalize = (str: string) => 
      str.toLowerCase()
         .replace(/[^\w\s]/g, ' ')
         .replace(/\s+/g, ' ')
         .trim()
         .split(' ')
         .filter(word => word.length > 2) // Remove short words
    
    const words1 = new Set(normalize(str1))
    const words2 = new Set(normalize(str2))
    
    if (words1.size === 0 && words2.size === 0) return 1
    if (words1.size === 0 || words2.size === 0) return 0
    
    // Jaccard similarity: intersection / union
    const intersection = new Set([...words1].filter(word => words2.has(word)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }, [])

  // Check if analysis is duplicate or too similar to recent entries
  const isDuplicateOrSimilar = useCallback((newAnalysis: string): { isDuplicate: boolean, similarity: number, reason?: string } => {
    if (!enableDeduplication || analysisHistory.length === 0) {
      return { isDuplicate: false, similarity: 0 }
    }

    const now = Date.now()
    
    // Check time interval since last analysis
    if (now - lastAnalysisTime.current < minTimeInterval) {
      return { 
        isDuplicate: true, 
        similarity: 1, 
        reason: `Too soon (${Math.floor((now - lastAnalysisTime.current) / 1000)}s ago)` 
      }
    }

    // Check similarity with recent entries (last 5)
    const recentEntries = analysisHistory.slice(0, 5)
    
    for (const entry of recentEntries) {
      const similarity = calculateSimilarity(newAnalysis, entry.content)
      
      if (similarity >= similarityThreshold) {
        return { 
          isDuplicate: true, 
          similarity, 
          reason: `Too similar (${Math.round(similarity * 100)}% match)` 
        }
      }
    }

    // Check for exact duplicates in recent history
    const exactMatch = recentEntries.find(entry => 
      entry.content.trim().toLowerCase() === newAnalysis.trim().toLowerCase()
    )
    
    if (exactMatch) {
      return { 
        isDuplicate: true, 
        similarity: 1, 
        reason: "Exact duplicate" 
      }
    }

    return { isDuplicate: false, similarity: 0 }
  }, [analysisHistory, enableDeduplication, minTimeInterval, similarityThreshold, calculateSimilarity])

  const addAnalysis = useCallback((analysis: string, type?: string): { added: boolean, reason?: string } => {
    if (!analysis || analysis.trim().length === 0) {
      return { added: false, reason: "Empty analysis" }
    }

    const duplicateCheck = isDuplicateOrSimilar(analysis)
    
    if (duplicateCheck.isDuplicate) {
      console.log(`Analysis skipped: ${duplicateCheck.reason}`)
      return { added: false, reason: duplicateCheck.reason }
    }

    const newEntry: AnalysisEntry = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: analysis.trim(),
      timestamp: Date.now(),
      type,
      similarity: duplicateCheck.similarity
    }

    setAnalysisHistory((prev) => {
      const updated = [newEntry, ...prev]
      
      // Limit to maxEntries
      if (updated.length > maxEntries) {
        return updated.slice(0, maxEntries)
      }
      
      return updated
    })

    lastAnalysisTime.current = Date.now()
    
    return { added: true }
  }, [isDuplicateOrSimilar, maxEntries])

  const removeAnalysis = useCallback((id: string) => {
    setAnalysisHistory((prev) => prev.filter(entry => entry.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setAnalysisHistory([])
    lastAnalysisTime.current = 0
  }, [])

  const getAnalysisById = useCallback((id: string): AnalysisEntry | undefined => {
    return analysisHistory.find(entry => entry.id === id)
  }, [analysisHistory])

  const getAnalysesByType = useCallback((type: string): AnalysisEntry[] => {
    return analysisHistory.filter(entry => entry.type === type)
  }, [analysisHistory])

  const getRecentAnalyses = useCallback((count: number = 5): AnalysisEntry[] => {
    return analysisHistory.slice(0, count)
  }, [analysisHistory])

  const exportAnalyses = useCallback((): string => {
    return analysisHistory.map((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleString()
      return `Analysis ${analysisHistory.length - index}:\nTimestamp: ${date}\nType: ${entry.type || 'general'}\nContent: ${entry.content}\n\n`
    }).join('')
  }, [analysisHistory])

  // Get just the content for backward compatibility
  const analysisHistoryContent = analysisHistory.map(entry => entry.content)

  return { 
    analysisHistory: analysisHistoryContent, // For backward compatibility
    analysisEntries: analysisHistory, // Full entries with metadata
    addAnalysis, 
    removeAnalysis,
    clearHistory,
    getAnalysisById,
    getAnalysesByType,
    getRecentAnalyses,
    exportAnalyses,
    stats: {
      total: analysisHistory.length,
      lastAnalysisTime: lastAnalysisTime.current,
      duplicatesSkipped: 0 // Could track this if needed
    }
  }
}
