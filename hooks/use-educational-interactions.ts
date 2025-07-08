"use client"

import { useState, useCallback } from "react"
import type { EducationalInteractionData, VideoLearningContext } from "@/lib/educational-gemini-service"

export function useEducationalInteractions() {
  const [interactionHistory, setInteractionHistory] = useState<EducationalInteractionData[]>([])
  const [currentVideoContext, setCurrentVideoContext] = useState<VideoLearningContext | null>(null)
  const [learningStats, setLearningStats] = useState({
    totalInteractions: 0,
    correctAnswers: 0,
    averageTimeSpent: 0,
    currentStreak: 0,
  })

  const addInteraction = useCallback((interaction: EducationalInteractionData) => {
    setInteractionHistory((prev) => {
      const newHistory = [interaction, ...prev.slice(0, 19)] // Keep last 20 interactions

      // Update learning stats
      const totalInteractions = newHistory.length
      const correctAnswers = newHistory.filter((i) => i.isCorrect === true).length
      const totalTimeSpent = newHistory.reduce((sum, i) => sum + (i.timeSpent || 0), 0)
      const averageTimeSpent = totalTimeSpent / totalInteractions

      // Calculate current streak
      let currentStreak = 0
      for (const i of newHistory) {
        if (i.isCorrect === true) {
          currentStreak++
        } else if (i.isCorrect === false) {
          break
        }
      }

      setLearningStats({
        totalInteractions,
        correctAnswers,
        averageTimeSpent,
        currentStreak,
      })

      return newHistory
    })
  }, [])

  const setVideoContext = useCallback((context: VideoLearningContext) => {
    setCurrentVideoContext(context)
    // Reset stats for new video
    setLearningStats({
      totalInteractions: 0,
      correctAnswers: 0,
      averageTimeSpent: 0,
      currentStreak: 0,
    })
  }, [])

  const clearHistory = useCallback(() => {
    setInteractionHistory([])
    setLearningStats({
      totalInteractions: 0,
      correctAnswers: 0,
      averageTimeSpent: 0,
      currentStreak: 0,
    })
  }, [])

  const getAccuracyRate = useCallback(() => {
    if (learningStats.totalInteractions === 0) return 0
    return Math.round((learningStats.correctAnswers / learningStats.totalInteractions) * 100)
  }, [learningStats])

  const getLearningLevel = useCallback(() => {
    const accuracy = getAccuracyRate()
    if (accuracy >= 90) return "Expert"
    if (accuracy >= 75) return "Advanced"
    if (accuracy >= 60) return "Intermediate"
    return "Beginner"
  }, [getAccuracyRate])

  return {
    interactionHistory,
    currentVideoContext,
    learningStats,
    addInteraction,
    setVideoContext,
    clearHistory,
    getAccuracyRate,
    getLearningLevel,
  }
}
