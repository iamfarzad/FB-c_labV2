import { getSupabase } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // Check admin authentication
  const authResult = await adminAuthMiddleware(request);
  if (authResult) {
    return authResult;
  }
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "leads"
    const period = searchParams.get("period") || "7d"

    const supabase = getSupabase()

    // Calculate date range
    const now = new Date()
    const daysBack = period === "1d" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    if (type === "leads") {
      const { data: leads } = await supabase
        .from("lead_summaries")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      // Convert to CSV
      const csvHeaders = "Name,Email,Company,Lead Score,Created At,Consultant Brief,AI Capabilities\n"
      const csvRows =
        leads
          ?.map(
            (lead) =>
              `"${lead.name}","${lead.email}","${lead.company_name || ""}",${lead.lead_score},"${lead.created_at}","${lead.consultant_brief?.replace(/"/g, '""') || ""}","${(lead.ai_capabilities_shown || []).join("; ")}"`,
          )
          .join("\n") || ""

      const csvContent = csvHeaders + csvRows

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-${period}.csv"`,
        },
      })
    }

    // Default fallback
    return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
