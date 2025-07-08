import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("meetings")
      .select("meeting_time")
      .eq("meeting_date", date)
      .in("status", ["scheduled", "confirmed"])

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch booked slots" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Booked slots fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
