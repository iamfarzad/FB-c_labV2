"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, TrendingDown, Activity, Zap, BarChart3 } from "lucide-react"

interface TokenUsageData {
  provider: string
  model: string
  totalTokens: number
  totalCost: number
  requestCount: number
  averageCost: number
}

interface CostTrend {
  date: string
  cost: number
  tokens: number
}

export function TokenCostAnalytics() {
  const [usageData, setUsageData] = useState<TokenUsageData[]>([])
  const [costTrends, setCostTrends] = useState<CostTrend[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTokenUsageData()
  }, [])

  const fetchTokenUsageData = async () => {
    try {
      const response = await fetch("/api/admin/token-usage")
      if (response.ok) {
        const data = await response.json()
        setUsageData(data.usage || [])
        setCostTrends(data.trends || [])
        setTotalCost(data.totalCost || 0)
      }
    } catch (error) {
      console.error("Failed to fetch token usage data:", error)
      // Set mock data for development
      setUsageData([
        {
          provider: "gemini",
          model: "gemini-1.5-flash",
          totalTokens: 125000,
          totalCost: 0.45,
          requestCount: 89,
          averageCost: 0.005,
        },
        {
          provider: "openai",
          model: "gpt-4o-mini",
          totalTokens: 75000,
          totalCost: 0.23,
          requestCount: 34,
          averageCost: 0.007,
        },
      ])
      setCostTrends([
        { date: "2024-01-01", cost: 0.12, tokens: 45000 },
        { date: "2024-01-02", cost: 0.18, tokens: 67000 },
        { date: "2024-01-03", cost: 0.25, tokens: 89000 },
        { date: "2024-01-04", cost: 0.31, tokens: 112000 },
        { date: "2024-01-05", cost: 0.45, tokens: 125000 },
      ])
      setTotalCost(0.68)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCost = (cost: number) => {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(2)}k`
    }
    return `$${cost.toFixed(4)}`
  }

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      gemini: "bg-blue-500",
      openai: "bg-green-500",
      anthropic: "bg-purple-500",
      groq: "bg-orange-500",
    }
    return colors[provider] || "bg-gray-500"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const yesterdayCost = costTrends.length > 1 ? costTrends[costTrends.length - 2].cost : 0
  const todayCost = costTrends.length > 0 ? costTrends[costTrends.length - 1].cost : 0
  const costChange = todayCost - yesterdayCost
  const costChangePercent = yesterdayCost > 0 ? (costChange / yesterdayCost) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCost(totalCost)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {costChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(costChangePercent).toFixed(1)}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.reduce((sum, item) => sum + item.totalTokens, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {usageData.reduce((sum, item) => sum + item.requestCount, 0)} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Request</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCost(totalCost / usageData.reduce((sum, item) => sum + item.requestCount, 1))}
            </div>
            <p className="text-xs text-muted-foreground">Per API request</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage by Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Usage by Provider & Model
          </CardTitle>
          <CardDescription>Token usage and costs broken down by AI provider and model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getProviderColor(item.provider)}`} />
                    <div>
                      <div className="font-medium capitalize">{item.provider}</div>
                      <div className="text-sm text-muted-foreground">{item.model}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCost(item.totalCost)}</div>
                    <div className="text-sm text-muted-foreground">{item.totalTokens.toLocaleString()} tokens</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.requestCount} requests</span>
                    <span>Avg: {formatCost(item.averageCost)}/request</span>
                  </div>
                  <Progress value={(item.totalCost / totalCost) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trends</CardTitle>
          <CardDescription>Daily token usage costs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {costTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="text-sm">{new Date(trend.date).toLocaleDateString()}</div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{trend.tokens.toLocaleString()} tokens</Badge>
                  <div className="font-medium">{formatCost(trend.cost)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Named export for compatibility
