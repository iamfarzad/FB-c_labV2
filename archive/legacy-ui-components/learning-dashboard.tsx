"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp } from "lucide-react"

interface LearningDashboardProps {
  stats: {
    totalInteractions: number
    correctAnswers: number
    averageTimeSpent: number
    currentStreak: number
  }
  accuracyRate: number
  learningLevel: string
  learningObjectives?: string[]
}

export function LearningDashboard({
  stats,
  accuracyRate,
  learningLevel,
  learningObjectives = [],
}: LearningDashboardProps) {
  return (
    <div className="space-y-4">
      <div className="learning-stats">
        <div className="learning-stat">
          <div className="learning-stat-value">{stats.totalInteractions}</div>
          <div className="learning-stat-label">Interactions</div>
        </div>
        <div className="learning-stat">
          <div className="learning-stat-value">{accuracyRate}%</div>
          <div className="learning-stat-label">Accuracy</div>
        </div>
        <div className="learning-stat">
          <div className="learning-stat-value">{Math.round(stats.averageTimeSpent)}s</div>
          <div className="learning-stat-label">Avg Time</div>
        </div>
        <div className="learning-stat">
          <div className="learning-stat-value">{stats.currentStreak}</div>
          <div className="learning-stat-label">Streak</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Overall Progress</span>
                <Badge variant={accuracyRate >= 75 ? "default" : "secondary"}>{learningLevel}</Badge>
              </div>
              <Progress value={accuracyRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {stats.currentStreak > 0 ? "Keep it up!" : "Start your streak!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {learningObjectives.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Objectives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
