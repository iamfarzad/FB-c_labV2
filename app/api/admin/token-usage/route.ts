import { getSupabase } from "@/lib/supabase/server"
import { TokenCostCalculator } from "@/lib/token-cost-calculator"
import type { NextRequest } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(req);
  if (authResult) {
    return authResult;
  }
  try {
    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "24h"
    const provider = searchParams.get("provider")
    const model = searchParams.get("model")

    const supabase = getSupabase()

    // Calculate time range
    const now = new Date()
    let startTime: Date

    switch (timeframe) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    let query = supabase
      .from("token_usage_logs")
      .select("*")
      .gte("created_at", startTime.toISOString())
      .order("created_at", { ascending: false })

    if (provider) {
      query = query.eq("provider", provider)
    }

    if (model) {
      query = query.eq("model", model)
    }

    const { data: usageLogs, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch token usage" }, { status: 500 })
    }

    // Calculate analytics
    const totalCost = usageLogs?.reduce((sum, log) => sum + log.total_cost, 0) || 0
    const totalTokens = usageLogs?.reduce((sum, log) => sum + log.total_tokens, 0) || 0
    const totalRequests = usageLogs?.length || 0

    const providerBreakdown = TokenCostCalculator.calculateProviderBreakdown(usageLogs || [])
    const dailyCosts = TokenCostCalculator.calculateDailyCosts(usageLogs || [])

    // Model breakdown
    const modelBreakdown: Record<string, { cost: number; usage: number; requests: number }> = {}
    usageLogs?.forEach((log) => {
      const key = `${log.provider}/${log.model}`
      if (!modelBreakdown[key]) {
        modelBreakdown[key] = { cost: 0, usage: 0, requests: 0 }
      }
      modelBreakdown[key].cost += log.total_cost
      modelBreakdown[key].usage += log.total_tokens
      modelBreakdown[key].requests += 1
    })

    return NextResponse.json({
      summary: {
        totalCost: Number(totalCost.toFixed(6)),
        totalTokens,
        totalRequests,
        averageCostPerRequest: totalRequests > 0 ? Number((totalCost / totalRequests).toFixed(6)) : 0,
        timeframe,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
      },
      breakdown: {
        byProvider: providerBreakdown,
        byModel: modelBreakdown,
        byDay: dailyCosts,
      },
      logs: usageLogs || [],
    })
  } catch (error: any) {
    console.error("Token usage fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(req);
  if (authResult) {
    return authResult;
  }
  try {
    const usageData = await req.json()

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("token_usage_logs")
      .insert({
        session_id: usageData.sessionId,
        provider: usageData.provider,
        model: usageData.model,
        input_tokens: usageData.inputTokens,
        output_tokens: usageData.outputTokens,
        total_tokens: usageData.totalTokens,
        input_cost: usageData.inputCost,
        output_cost: usageData.outputCost,
        total_cost: usageData.totalCost,
        request_type: usageData.requestType || "chat",
        user_id: usageData.userId,
        metadata: usageData.metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to log token usage" }, { status: 500 })
    }

    return NextResponse.json({ success: true, log: data })
  } catch (error: any) {
    console.error("Token usage logging error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
