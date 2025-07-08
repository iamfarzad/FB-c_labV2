import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const date = searchParams.get("date")
    const leadId = searchParams.get("leadId")

    const supabase = getSupabase()

    let query = supabase
      .from("meetings")
      .select("*")
      .order("meeting_date", { ascending: true })
      .order("meeting_time", { ascending: true })

    if (status) {
      query = query.eq("status", status)
    }

    if (date) {
      query = query.eq("meeting_date", date)
    }

    if (leadId) {
      query = query.eq("lead_id", leadId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Meetings fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
