"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Clock, CheckCircle, AlertTriangle, Brain, Target, Activity } from "lucide-react"

interface AIPerformanceMetricsProps {
  period: string
}

interface PerformanceData {
  responseTime: Array<{ timestamp: string; avgTime: number; p95Time: number }>
  successRate: number
  errorRate: number
  tokenUsage: Array<{ date: string; tokens: number; cost: number }>
  modelPerformance: Array<{ model: string; requests: number; successRate: number; avgTime: number }>
  toolUsage: Array<{ tool: string; calls: number; successRate: number; avgTime: number }>
  qualityMetrics: {
    relevanceScore: number
    accuracyScore: number
    userSatisfaction: number
    completionRate: number
  }
}

export function AIPerformanceMetrics({ period }: AIPerformanceMetricsProps) {
  const [performance, setPerformance] = useState<PerformanceData>({
    responseTime: [],
    successRate: 0,
    errorRate: 0,
    tokenUsage: [],
    modelPerformance: [],
    toolUsage: [],
    qualityMetrics: {
      relevanceScore: 0,
      accuracyScore: 0,
      userSatisfaction: 0,
      completionRate: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceMetrics()
  }, [period])

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/ai-performance?period=${period}`)
      const data = await response.json()
      setPerformance(data)
    } catch (error) {
      console.error("Failed to fetch AI performance metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.successRate}%</div>
            <Progress value={performance.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.errorRate}%</div>
            <Progress value={performance.errorRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.responseTime.length > 0
                ? Math.round(performance.responseTime[performance.responseTime.length - 1]?.avgTime || 0)
                : 0}
              ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              P95:{" "}
              {performance.responseTime.length > 0
                ? Math.round(performance.responseTime[performance.responseTime.length - 1]?.p95Time || 0)
                : 0}
              ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.qualityMetrics.userSatisfaction}%</div>
            <Progress value={performance.qualityMetrics.userSatisfaction} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Average and P95 response times over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performance.responseTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#8884d8" strokeWidth={2} name="Average" />
                <Line type="monotone" dataKey="p95Time" stroke="#82ca9d" strokeWidth={2} name="P95" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Token Usage & Cost</CardTitle>
            <CardDescription>Daily token consumption and associated costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performance.tokenUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="tokens" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="cost" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>AI Quality Metrics</CardTitle>
          <CardDescription>Comprehensive quality assessment of AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold mb-1">{performance.qualityMetrics.relevanceScore}%</div>
              <div className="text-sm text-muted-foreground">Relevance Score</div>
              <Progress value={performance.qualityMetrics.relevanceScore} className="mt-2" />
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold mb-1">{performance.qualityMetrics.accuracyScore}%</div>
              <div className="text-sm text-muted-foreground">Accuracy Score</div>
              <Progress value={performance.qualityMetrics.accuracyScore} className="mt-2" />
            </div>

            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold mb-1">{performance.qualityMetrics.userSatisfaction}%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
              <Progress value={performance.qualityMetrics.userSatisfaction} className="mt-2" />
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Activity className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold mb-1">{performance.qualityMetrics.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
              <Progress value={performance.qualityMetrics.completionRate} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance</CardTitle>
            <CardDescription>Performance comparison across different AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.modelPerformance.map((model, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{model.model}</h4>
                      <Badge variant={getScoreBadge(model.successRate)}>{model.successRate}% success</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Requests: {model.requests}</div>
                      <div>Avg Time: {model.avgTime}ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tool Usage Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Usage Performance</CardTitle>
            <CardDescription>Performance metrics for AI tools and functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.toolUsage.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{tool.tool}</h4>
                      <Badge variant={getScoreBadge(tool.successRate)}>{tool.successRate}% success</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Calls: {tool.calls}</div>
                      <div>Avg Time: {tool.avgTime}ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
