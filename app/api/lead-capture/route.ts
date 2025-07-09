import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import type { LeadCaptureData } from "@/app/chat/types/lead-capture"

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadCaptureData = await request.json()

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.tcAcceptance?.accepted) {
      return NextResponse.json({ error: "Missing required fields: name, email, and terms acceptance" }, { status: 400 })
    }

    // Calculate lead score based on provided information
    let leadScore = 0
    if (leadData.company) leadScore += 20
    if (leadData.role) leadScore += 15
    if (leadData.interests) leadScore += 25
    if (leadData.challenges) leadScore += 30
    if (leadData.initialQuery) leadScore += 10

    // Insert lead into database
    const { data, error } = await supabase
      .from("leads")
      .insert({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company || null,
        role: leadData.role || null,
        interests: leadData.interests || null,
        challenges: leadData.challenges || null,
        engagement_type: leadData.engagementType || "chat",
        initial_query: leadData.initialQuery || null,
        lead_score: leadScore,
        tc_acceptance: leadData.tcAcceptance,
        status: "new",
        source: "chat_onboarding",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to save lead data" }, { status: 500 })
    }

    // Log the lead capture activity
    await supabase.from("ai_interactions").insert({
      session_id: leadData.timestamp, // Using timestamp as session ID
      interaction_type: "lead_capture",
      user_input: `Lead captured: ${leadData.name} (${leadData.email})`,
      ai_response: "Lead information saved successfully",
      metadata: {
        leadId: data.id,
        leadScore,
        engagementType: leadData.engagementType,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      leadId: data.id,
      leadScore,
      message: "Lead captured successfully",
    })
  } catch (error) {
    console.error("Lead capture error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
