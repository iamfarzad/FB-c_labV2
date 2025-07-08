import { getSupabase } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    const supabase = getSupabase()

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get leads data
    const { data: leads } = await supabase.from("lead_summaries").select("*").gte("created_at", startDate.toISOString())

    // Process engagement types
    const engagementTypes = [
      { name: "chat", value: 0, color: "#8884d8" },
      { name: "voice", value: 0, color: "#82ca9d" },
      { name: "webcam", value: 0, color: "#ffc658" },
      { name: "screen_share", value: 0, color: "#ff7300" },
      { name: "image", value: 0, color: "#00ff00" },
    ]

    leads?.forEach((lead) => {
      if (lead.ai_capabilities_shown && Array.isArray(lead.ai_capabilities_shown)) {
        lead.ai_capabilities_shown.forEach((capability: string) => {
          const type = engagementTypes.find((t) => capability.toLowerCase().includes(t.name))
          if (type) type.value++
        })
      }
    })

    // Generate daily interactions (mock data)
    const dailyInteractions = []
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dailyInteractions.push({
        date: date.toISOString().split("T")[0],
        interactions: Math.floor(Math.random() * 50) + 10,
        leads: Math.floor(Math.random() * 10) + 2,
      })
    }

    // Process AI capabilities
    const capabilitiesMap = new Map()
    leads?.forEach((lead) => {
      if (lead.ai_capabilities_shown && Array.isArray(lead.ai_capabilities_shown)) {
        lead.ai_capabilities_shown.forEach((cap: string) => {
          capabilitiesMap.set(cap, (capabilitiesMap.get(cap) || 0) + 1)
        })
      }
    })

    const aiCapabilities = Array.from(capabilitiesMap.entries()).map(([capability, usage]) => ({
      capability,
      usage,
      conversion: Math.floor(Math.random() * 30) + 20, // Mock conversion rate
    }))

    // Generate peak hours (mock data)
    const peakHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      interactions: Math.floor(Math.random() * 20) + (hour >= 9 && hour <= 17 ? 20 : 5),
    }))

    return NextResponse.json({
      engagementTypes,
      dailyInteractions,
      aiCapabilities,
      averageSessionTime: 8.5,
      totalInteractions: leads?.length || 0,
      peakHours,
    })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
