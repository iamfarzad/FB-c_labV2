import { supabaseService } from "@/lib/supabase/client"
import type { NextRequest } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { NextResponse } from "next/server"
import { getUsageStats } from "@/lib/token-usage-logger"

interface TokenUsageLog {
  id: string
  user_id?: string
  session_id?: string
  model: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  estimated_cost: string | number
  task_type: string
  endpoint: string
  success: boolean
  error_message?: string
  created_at?: string
}

export async function GET(req: NextRequest) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(req);
  if (authResult) {
    return authResult;
  }
  
  try {
    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "24h"
    const userId = searchParams.get("userId")

    // Convert timeframe to days
    let days = 1
    switch (timeframe) {
      case "1h":
        days = 1 // Will filter by hours in the query
        break
      case "24h":
        days = 1
        break
      case "7d":
        days = 7
        break
      case "30d":
        days = 30
        break
      case "90d":
        days = 90
        break
      default:
        days = 1
    }

    // Get real token usage data from token_usage_logs table
    const { data: logs, error: logsError } = await supabaseService
      .from("token_usage_logs")
      .select("*")
      .gte("created_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })

    if (logsError) {
      console.error("Token usage logs fetch error:", logsError)
      return NextResponse.json({ error: "Failed to fetch token usage data" }, { status: 500 })
    }

    // Filter by user if specified
    const filteredLogs: TokenUsageLog[] = userId ? (logs as TokenUsageLog[])?.filter(log => log.user_id === userId) : (logs as TokenUsageLog[]) || []

    // Calculate analytics
    const totalCost = filteredLogs.reduce((sum: number, log: TokenUsageLog) => sum + Number(log.estimated_cost), 0)
    const totalTokens = filteredLogs.reduce((sum: number, log: TokenUsageLog) => sum + log.total_tokens, 0)
    const totalRequests = filteredLogs.length

    // Provider breakdown (all Google for now)
    const providerBreakdown = { 
      google: { 
        cost: totalCost, 
        usage: totalTokens, 
        requests: totalRequests 
      } 
    }

    // Daily breakdown
    const dailyMap = new Map<string, { cost: number; tokens: number; requests: number }>()
    filteredLogs.forEach((log: TokenUsageLog) => {
      const date = log.created_at?.split('T')[0] || 'unknown'
      const current = dailyMap.get(date) || { cost: 0, tokens: 0, requests: 0 }
      dailyMap.set(date, {
        cost: current.cost + Number(log.estimated_cost),
        tokens: current.tokens + log.total_tokens,
        requests: current.requests + 1
      })
    })

    const dailyCosts = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      cost: stats.cost,
      tokens: stats.tokens,
      requests: stats.requests
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Model breakdown
    const modelBreakdown: Record<string, { cost: number; usage: number; requests: number }> = {}
    filteredLogs.forEach((log: TokenUsageLog) => {
      const model = log.model
      if (!modelBreakdown[model]) {
        modelBreakdown[model] = { cost: 0, usage: 0, requests: 0 }
      }
      modelBreakdown[model].cost += Number(log.estimated_cost)
      modelBreakdown[model].usage += log.total_tokens
      modelBreakdown[model].requests += 1
    })

    // Task type breakdown
    const taskBreakdown: Record<string, { cost: number; usage: number; requests: number }> = {}
    filteredLogs.forEach((log: TokenUsageLog) => {
      const taskType = log.task_type
      if (!taskBreakdown[taskType]) {
        taskBreakdown[taskType] = { cost: 0, usage: 0, requests: 0 }
      }
      taskBreakdown[taskType].cost += Number(log.estimated_cost)
      taskBreakdown[taskType].usage += log.total_tokens
      taskBreakdown[taskType].requests += 1
    })

    // Success rate
    const successfulRequests = filteredLogs.filter(log => log.success).length
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0

    return NextResponse.json({
      summary: {
        totalCost: Number(totalCost.toFixed(6)),
        totalTokens,
        totalRequests,
        successfulRequests,
        successRate: Number(successRate.toFixed(2)),
        averageCostPerRequest: totalRequests > 0 ? Number((totalCost / totalRequests).toFixed(6)) : 0,
        averageTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0,
        timeframe,
        startTime: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
      },
      breakdown: {
        byProvider: providerBreakdown,
        byModel: modelBreakdown,
        byTaskType: taskBreakdown,
        byDay: dailyCosts,
      },
      logs: filteredLogs.map((log: TokenUsageLog) => ({
        id: log.id,
        session_id: log.session_id,
        provider: 'google',
        model: log.model,
        input_tokens: log.input_tokens,
        output_tokens: log.output_tokens,
        total_tokens: log.total_tokens,
        input_cost: Number(log.estimated_cost) * (log.input_tokens / log.total_tokens),
        output_cost: Number(log.estimated_cost) * (log.output_tokens / log.total_tokens),
        total_cost: Number(log.estimated_cost),
        request_type: log.task_type,
        user_id: log.user_id,
        endpoint: log.endpoint,
        success: log.success,
        error_message: log.error_message,
        metadata: {},
        created_at: log.created_at
      })),
    })
  } catch (error: any) {
    console.error("Token usage fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST method removed - token_usage_logs table not available in current schema
