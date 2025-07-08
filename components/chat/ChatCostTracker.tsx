"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TokenCostCalculator } from "@/lib/token-cost-calculator"
import { DollarSign, Eye, EyeOff, AlertTriangle, TrendingUp } from "lucide-react"

interface ChatCostTrackerProps {
  sessionId: string
  className?: string
}

interface SessionCost {
  totalCost: number
  totalTokens: number
  requestCount: number
  recentRequests: Array<{
    provider: string
    model: string
    cost: number
    tokens: number
    timestamp: string
  }>
}

interface DailyBudget {
  limit: number
  spent: number
  remaining: number
  percentage: number
}

export default function ChatCostTracker({ sessionId, className }: ChatCostTrackerProps) {
  const [sessionCost, setSessionCost] = useState<SessionCost>({
    totalCost: 0,
    totalTokens: 0,
    requestCount: 0,
    recentRequests: [],
  })
  const [dailyBudget, setDailyBudget] = useState<DailyBudget>({
    limit: 10.0, // $10 daily limit
    spent: 0,
    remaining: 10.0,
    percentage: 0,
  })
  const [isVisible, setIsVisible] = useState(true)
  const [loading, setLoading] = useState(false)

  // Fetch session costs
  const fetchSessionCosts = async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/token-usage?timeframe=24h&session=${sessionId}`)
      if (!response.ok) throw new Error("Failed to fetch session costs")

      const data = await response.json()

      // Calculate session totals
      const sessionLogs = data.logs?.filter((log: any) => log.session_id === sessionId) || []
      const totalCost = sessionLogs.reduce((sum: number, log: any) => sum + log.total_cost, 0)
      const totalTokens = sessionLogs.reduce((sum: number, log: any) => sum + log.total_tokens, 0)

      // Get recent requests (last 5)
      const recentRequests = sessionLogs.slice(0, 5).map((log: any) => ({
        provider: log.provider,
        model: log.model,
        cost: log.total_cost,
        tokens: log.total_tokens,
        timestamp: log.created_at,
      }))

      setSessionCost({
        totalCost,
        totalTokens,
        requestCount: sessionLogs.length,
        recentRequests,
      })

      // Calculate daily budget
      const dailySpent = data.summary?.totalCost || 0
      const dailyLimit = dailyBudget.limit
      const remaining = Math.max(0, dailyLimit - dailySpent)
      const percentage = (dailySpent / dailyLimit) * 100

      setDailyBudget({
        limit: dailyLimit,
        spent: dailySpent,
        remaining,
        percentage: Math.min(percentage, 100),
      })
    } catch (error) {
      console.error("Error fetching session costs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Log token usage for this session
  const logTokenUsage = async (provider: string, model: string, inputTokens: number, outputTokens: number) => {
    try {
      const totalTokens = inputTokens + outputTokens
      const cost = TokenCostCalculator.calculateCost(provider, model, {
        inputTokens,
        outputTokens,
        totalTokens,
      })

      await fetch("/api/admin/token-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          provider,
          model,
          inputTokens,
          outputTokens,
          totalTokens,
          inputCost: cost.inputCost,
          outputCost: cost.outputCost,
          totalCost: cost.totalCost,
          requestType: "chat",
        }),
      })

      // Refresh costs after logging
      fetchSessionCosts()
    } catch (error) {
      console.error("Error logging token usage:", error)
    }
  }

  useEffect(() => {
    fetchSessionCosts()

    // Refresh every 30 seconds
    const interval = setInterval(fetchSessionCosts, 30000)
    return () => clearInterval(interval)
  }, [sessionId])

  // Expose logTokenUsage function globally for use by chat components
  useEffect(() => {
    ;(window as any).logTokenUsage = logTokenUsage
  }, [sessionId])

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Costs
      </Button>
    )
  }

  const isOverBudget = dailyBudget.percentage > 100
  const isNearLimit = dailyBudget.percentage > 80

  return (
    <Card className={`fixed bottom-4 right-4 w-80 z-50 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Session Costs
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Session Cost</p>
            <p className="font-semibold">{TokenCostCalculator.formatCost(sessionCost.totalCost)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tokens Used</p>
            <p className="font-semibold">{sessionCost.totalTokens.toLocaleString()}</p>
          </div>
        </div>

        {/* Daily Budget */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Budget</span>
            <div className="flex items-center gap-2">
              {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
              <Badge variant={isOverBudget ? "destructive" : isNearLimit ? "secondary" : "default"}>
                {dailyBudget.percentage.toFixed(1)}%
              </Badge>
            </div>
          </div>

          <Progress
            value={dailyBudget.percentage}
            className={`h-2 ${isOverBudget ? "bg-red-100" : isNearLimit ? "bg-yellow-100" : ""}`}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{TokenCostCalculator.formatCost(dailyBudget.spent)} spent</span>
            <span>{TokenCostCalculator.formatCost(dailyBudget.remaining)} remaining</span>
          </div>

          {isOverBudget && (
            <p className="text-xs text-red-600">
              Over budget by {TokenCostCalculator.formatCost(dailyBudget.spent - dailyBudget.limit)}
            </p>
          )}
        </div>

        {/* Recent Requests */}
        {sessionCost.recentRequests.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Requests
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {sessionCost.recentRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">
                      {request.provider}/{request.model}
                    </p>
                    <p className="text-muted-foreground">{request.tokens.toLocaleString()} tokens</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{TokenCostCalculator.formatCost(request.cost)}</p>
                    <p className="text-muted-foreground">{new Date(request.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="ml-2 text-xs text-muted-foreground">Updating...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
