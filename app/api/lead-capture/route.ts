import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

interface LeadCaptureData {
  name: string
  email: string
  company?: string
  engagementType: "chat" | "voice" | "screen_share" | "webcam"
  initialQuery?: string
  tcAcceptance: {
    accepted: boolean
    timestamp: number
    userAgent?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const leadData: LeadCaptureData = await req.json()

    const supabase = getSupabase()

    // Save lead with TC acceptance
    const { data, error } = await supabase
      .from("lead_summaries")
      .insert({
        name: leadData.name,
        email: leadData.email,
        company_name: leadData.company,
        conversation_summary: `Initial engagement via ${leadData.engagementType}${leadData.initialQuery ? `: "${leadData.initialQuery}"` : ""}`,
        consultant_brief: `New lead captured via ${leadData.engagementType}. TC accepted at ${new Date(leadData.tcAcceptance.timestamp).toISOString()}`,
        lead_score: 50, // Default score for new leads
        ai_capabilities_shown: [leadData.engagementType],
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to save lead data" }, { status: 500 })
    }

    // Trigger AI research in background
    fetch("/api/lead-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
      }),
    }).catch(console.error) // Fire and forget

    return NextResponse.json({
      success: true,
      leadId: data.id,
      message: "Lead captured successfully",
    })
  } catch (error: any) {
    console.error("Lead capture error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
