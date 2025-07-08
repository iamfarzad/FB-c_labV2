import { type NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase/server"
import { activityLogger } from "@/lib/activity-logger"
import type { LeadCaptureData } from "@/app/chat/types/lead-capture"

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadCaptureData = await request.json()

    // Validate required fields
    if (!leadData.name || !leadData.email || !leadData.tcAcceptance?.accepted) {
      return NextResponse.json({ error: "Missing required fields: name, email, and terms acceptance" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(leadData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = getSupabase()

    // Check if lead already exists
    const { data: existingLead } = await supabase.from("leads").select("id, email").eq("email", leadData.email).single()

    let leadId: string

    if (existingLead) {
      // Update existing lead
      const { data: updatedLead, error: updateError } = await supabase
        .from("leads")
        .update({
          name: leadData.name,
          company: leadData.company || null,
          role: leadData.role || null,
          interests: leadData.interests || null,
          challenges: leadData.challenges || null,
          session_summary: leadData.sessionSummary || null,
          updated_at: new Date().toISOString(),
          tc_acceptance: leadData.tcAcceptance,
        })
        .eq("id", existingLead.id)
        .select("id")
        .single()

      if (updateError) {
        console.error("Error updating lead:", updateError)
        throw new Error("Failed to update lead information")
      }

      leadId = updatedLead.id
    } else {
      // Create new lead
      const { data: newLead, error: insertError } = await supabase
        .from("leads")
        .insert({
          name: leadData.name,
          email: leadData.email,
          company: leadData.company || null,
          role: leadData.role || null,
          interests: leadData.interests || null,
          challenges: leadData.challenges || null,
          session_summary: leadData.sessionSummary || null,
          tc_acceptance: leadData.tcAcceptance,
          lead_score: calculateLeadScore(leadData),
          status: "new",
          source: "chat_interaction",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("Error creating lead:", insertError)
        throw new Error("Failed to save lead information")
      }

      leadId = newLead.id
    }

    // Log the activity
    await activityLogger.log({
      type: "lead_capture",
      title: "Lead Captured",
      description: `New lead: ${leadData.name} (${leadData.email})`,
      status: "completed",
      metadata: {
        leadId,
        company: leadData.company,
        role: leadData.role,
        source: "chat_interaction",
      },
    })

    // Send welcome email (optional - implement if needed)
    // await sendWelcomeEmail(leadData)

    return NextResponse.json({
      success: true,
      leadId,
      message: "Lead information saved successfully",
    })
  } catch (error: any) {
    console.error("Lead capture error:", error)
    return NextResponse.json({ error: error.message || "Failed to process lead capture" }, { status: 500 })
  }
}

function calculateLeadScore(leadData: LeadCaptureData): number {
  let score = 0

  // Base score for providing contact info
  score += 20

  // Company provided
  if (leadData.company) score += 15

  // Role provided
  if (leadData.role) {
    score += 10
    // Higher score for decision-maker roles
    const decisionMakerRoles = ["ceo", "cto", "founder", "director", "manager", "head"]
    if (decisionMakerRoles.some((role) => leadData.role!.toLowerCase().includes(role))) {
      score += 15
    }
  }

  // Interests provided
  if (leadData.interests) score += 10

  // Challenges provided (shows engagement)
  if (leadData.challenges) score += 15

  // Session summary exists (engaged with chat)
  if (leadData.sessionSummary) score += 15

  return Math.min(score, 100) // Cap at 100
}
