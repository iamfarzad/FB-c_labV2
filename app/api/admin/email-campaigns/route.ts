import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { adminAuthMiddleware } from "@/lib/auth"
import { adminRateLimit } from "@/lib/rate-limiting"
import { NextResponse } from "next/server"

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
    const supabase = getSupabase()

    const { data, error } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch email campaigns" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Email campaigns fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    const campaignData = await req.json()

    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("email_campaigns")
      .insert({
        name: campaignData.name,
        subject: campaignData.subject,
        template: campaignData.template,
        target_segment: campaignData.targetSegment,
        status: "sent",
        sent_count: campaignData.sentCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to create email campaign" }, { status: 500 })
    }

    return NextResponse.json({ success: true, campaign: data })
  } catch (error: any) {
    console.error("Email campaign creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
