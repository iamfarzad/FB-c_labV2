import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "7d"

    const supabase = getSupabase()

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Fetch leads
    const { data: leads, error: leadsError } = await supabase
      .from("lead_summaries")
      .select("*")
      .gte("created_at", startDate.toISOString())

    if (leadsError) {
      console.error("Leads fetch error:", leadsError)
    }

    // Fetch conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from("chat_interactions")
      .select("*")
      .gte("created_at", startDate.toISOString())

    if (conversationsError) {
      console.error("Conversations fetch error:", conversationsError)
    }

    // Fetch token usage
    const { data: tokenUsage, error: tokenError } = await supabase
      .from("token_usage_logs")
      .select("total_cost")
      .gte("timestamp", startDate.toISOString())

    if (tokenError) {
      console.error("Token usage fetch error:", tokenError)
    }

    // Fetch meetings
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .gte("created_at", startDate.toISOString())

    if (meetingsError) {
      console.error("Meetings fetch error:", meetingsError)
    }

    // Calculate stats
    const totalLeads = leads?.length || 0
    const activeConversations =
      conversations?.filter((c) => {
        const lastActivity = new Date(c.updated_at)
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        return lastActivity > oneHourAgo
      }).length || 0

    const scheduledMeetings = meetings?.filter((m) => m.status === "scheduled" || m.status === "confirmed").length || 0
    const completedMeetings = meetings?.filter((m) => m.status === "completed").length || 0
    const conversionRate = totalLeads > 0 ? Math.round((completedMeetings / totalLeads) * 100) : 0

    const totalTokenCost = tokenUsage?.reduce((sum, usage) => sum + (usage.total_cost || 0), 0) || 0

    // Calculate average engagement time (mock data for now)
    const avgEngagementTime = conversations?.length ? Math.round(Math.random() * 15 + 5) : 0

    // Top AI capabilities (mock data)
    const topAICapabilities = ["Video Analysis", "Lead Research", "Content Generation", "Real-time Chat"]

    const recentActivity = conversations?.length || 0

    return NextResponse.json({
      totalLeads,
      activeConversations,
      conversionRate,
      avgEngagementTime,
      topAICapabilities,
      recentActivity,
      totalTokenCost,
      scheduledMeetings,
    })
  } catch (error: any) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
