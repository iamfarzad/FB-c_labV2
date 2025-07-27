import { supabaseService } from "@/lib/supabase/client"
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { adminRateLimit } from "@/lib/rate-limiting"

export async function GET(request: NextRequest) {
  // Check rate limiting
  const rateLimitResult = adminRateLimit(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const period = searchParams.get("period") || "7d"

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    let query = supabaseService
      .from("lead_summaries")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
    }

    // Add mock status and engagement_type for demo
    const enrichedLeads =
      leads?.map((lead: any) => ({
        ...lead,
        status: ["new", "contacted", "qualified", "converted"][Math.floor(Math.random() * 4)],
        engagement_type: lead.ai_capabilities_shown?.[0] || "chat",
      })) || []

    return NextResponse.json({
      leads: enrichedLeads,
      total: leads?.length || 0,
    })
  } catch (error) {
    console.error("Admin leads error:", error)
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}
