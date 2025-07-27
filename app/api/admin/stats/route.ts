import { supabaseService } from "@/lib/supabase/client"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { adminRateLimit } from "@/lib/rate-limiting"

export async function GET(req: NextRequest) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResult = await adminAuthMiddleware(req);
  if (authResult) {
    return authResult;
  }
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get("period") || "7d"

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Fetch leads
    const { data: leads, error: leadsError } = await supabaseService
      .from("lead_summaries")
      .select("*")
      .gte("created_at", startDate.toISOString())

    if (leadsError) {
      console.error("Leads fetch error:", leadsError)
    }

    // Calculate stats from real data
    const totalLeads = leads?.length || 0
    
    // Calculate conversion rate based on lead scores
    const qualifiedLeads = leads?.filter(lead => (lead.lead_score || 0) >= 7).length || 0
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0

    // Calculate engagement metrics from lead data
    const leadsWithAI = leads?.filter(lead => lead.ai_capabilities_shown && lead.ai_capabilities_shown.length > 0).length || 0
    const engagementRate = totalLeads > 0 ? Math.round((leadsWithAI / totalLeads) * 100) : 0

    // Calculate average lead score
    const avgLeadScore = leads?.length ? 
      Math.round(leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / leads.length * 10) / 10 : 0

    // Get top AI capabilities from actual data
    const capabilityCounts = new Map<string, number>()
    leads?.forEach(lead => {
      if (lead.ai_capabilities_shown && Array.isArray(lead.ai_capabilities_shown)) {
        lead.ai_capabilities_shown.forEach(capability => {
          capabilityCounts.set(capability, (capabilityCounts.get(capability) || 0) + 1)
        })
      }
    })
    const topAICapabilities = Array.from(capabilityCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([capability]) => capability)

    const recentActivity = totalLeads // Use leads as activity indicator

    return NextResponse.json({
      totalLeads,
      activeConversations: 0, // Not available in current schema
      conversionRate,
      avgEngagementTime: Math.round(avgLeadScore * 2), // Derived from lead score
      topAICapabilities,
      recentActivity,
      totalTokenCost: 0, // Not available in current schema
      scheduledMeetings: 0, // Not available in current schema
      avgLeadScore,
      engagementRate,
    })
  } catch (error: any) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
