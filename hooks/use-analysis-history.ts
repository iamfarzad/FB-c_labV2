"use client"

import { useState, useCallback, useEffect } from 'react'

export interface AnalysisResult {
  id: string
  text: string
  timestamp: number
  type?: 'screen' | 'webcam' | 'document' | 'image'
  metadata?: {
    source?: string
    confidence?: number
    tags?: string[]
  }
}

interface AnalysisHistoryState {
  analyses: AnalysisResult[]
  isLoading: boolean
  error: string | null
}

interface UseAnalysisHistoryOptions {
  maxHistory?: number
  persistToStorage?: boolean
  storageKey?: string
  similarityThreshold?: number
}

const DEFAULT_OPTIONS: Required<UseAnalysisHistoryOptions> = {
  maxHistory: 50,
  persistToStorage: true,
  storageKey: 'analysis-history',
  similarityThreshold: 0.8
}

/**
 * Custom hook for managing AI analysis history with similarity detection and persistence
 */
export function useAnalysisHistory(options: UseAnalysisHistoryOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  const [state, setState] = useState<AnalysisHistoryState>({
    analyses: [],
    isLoading: false,
    error: null
  })

  // Load from localStorage on mount
  useEffect(() => {
    if (config.persistToStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(config.storageKey)
        if (stored) {
          const analyses = JSON.parse(stored) as AnalysisResult[]
          setState(prev => ({ ...prev, analyses }))
        }
      } catch (error) {
        console.warn('Failed to load analysis history from storage:', error)
      }
    }
  }, [config.persistToStorage, config.storageKey])

  // Save to localStorage when analyses change
  useEffect(() => {
    if (config.persistToStorage && typeof window !== 'undefined' && state.analyses.length > 0) {
      try {
        localStorage.setItem(config.storageKey, JSON.stringify(state.analyses))
      } catch (error) {
        console.warn('Failed to save analysis history to storage:', error)
      }
    }
  }, [state.analyses, config.persistToStorage, config.storageKey])

  // Simple text similarity using Jaccard similarity
  const calculateSimilarity = useCallback((text1: string, text2: string): number => {
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }, [])

  // Check if analysis is similar to existing ones
  const isDuplicate = useCallback((newAnalysis: AnalysisResult): boolean => {
    return state.analyses.some(existing => {
      const similarity = calculateSimilarity(existing.text, newAnalysis.text)
      return similarity >= config.similarityThreshold
    })
  }, [state.analyses, calculateSimilarity, config.similarityThreshold])

  // Add new analysis to history
  const addAnalysis = useCallback((analysis: Omit<AnalysisResult, 'id' | 'timestamp'>) => {
    const newAnalysis: AnalysisResult = {
      ...analysis,
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    // Check for duplicates
    if (isDuplicate(newAnalysis)) {
      console.info('Similar analysis already exists, skipping duplicate')
      return false
    }

    setState(prev => ({
      ...prev,
      analyses: [newAnalysis, ...prev.analyses].slice(0, config.maxHistory),
      error: null
    }))

    return true
  }, [isDuplicate, config.maxHistory])

  // Remove analysis by ID
  const removeAnalysis = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      analyses: prev.analyses.filter(analysis => analysis.id !== id)
    }))
  }, [])

  // Clear all analyses
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      analyses: []
    }))
    
    if (config.persistToStorage && typeof window !== 'undefined') {
      localStorage.removeItem(config.storageKey)
    }
  }, [config.persistToStorage, config.storageKey])

  // Get analyses by type
  const getAnalysesByType = useCallback((type: AnalysisResult['type']) => {
    return state.analyses.filter(analysis => analysis.type === type)
  }, [state.analyses])

  // Search analyses by text content
  const searchAnalyses = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return state.analyses.filter(analysis => 
      analysis.text.toLowerCase().includes(lowercaseQuery) ||
      analysis.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }, [state.analyses])

  // Get recent analyses (last N)
  const getRecentAnalyses = useCallback((count: number = 10) => {
    return state.analyses.slice(0, count)
  }, [state.analyses])

  // Get analysis statistics
  const getStats = useCallback(() => {
    const totalAnalyses = state.analyses.length
    const typeStats = state.analyses.reduce((acc, analysis) => {
      const type = analysis.type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const oldestTimestamp = state.analyses.length > 0 
      ? Math.min(...state.analyses.map(a => a.timestamp))
      : null

    const newestTimestamp = state.analyses.length > 0
      ? Math.max(...state.analyses.map(a => a.timestamp))
      : null

    return {
      totalAnalyses,
      typeStats,
      oldestTimestamp,
      newestTimestamp,
      timeRange: oldestTimestamp && newestTimestamp 
        ? newestTimestamp - oldestTimestamp 
        : null
    }
  }, [state.analyses])

  return {
    // State
    analyses: state.analyses,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    addAnalysis,
    removeAnalysis,
    clearHistory,
    
    // Queries
    getAnalysesByType,
    searchAnalyses,
    getRecentAnalyses,
    getStats,
    isDuplicate,
    
    // Computed
    hasAnalyses: state.analyses.length > 0,
    analysisCount: state.analyses.length
  }
}
