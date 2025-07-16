import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { validateInput, LeadCaptureSchema } from "@/lib/validation-schemas"
import { rateLimitMiddleware } from "@/lib/rate-limiter"
import { logActivity } from "@/lib/activity-logger"

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResponse = await rateLimitMiddleware(req)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate input
    const leadData = validateInput(LeadCaptureSchema, await req.json())

    const supabase = getSupabase()

    // Prepare data for lead_summaries table (matching actual schema)
    const leadRecord = {
      name: leadData.name,
      email: leadData.email,
      company_name: leadData.company || null,
      conversation_summary: `Initial engagement via ${leadData.engagementType}${leadData.initialQuery ? `: "${leadData.initialQuery}"` : ""}`,
      consultant_brief: `New lead captured via ${leadData.engagementType}. TC accepted at ${leadData.tcAcceptance?.timestamp ? new Date(leadData.tcAcceptance.timestamp).toISOString() : new Date().toISOString()}`,
      lead_score: 50,
      ai_capabilities_shown: [leadData.engagementType]
      // Don't include created_at - it has DEFAULT NOW()
    }

    // Save lead with better error handling
    const { data, error } = await supabase
      .from("lead_summaries")
      .insert(leadRecord)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // More specific error handling
      if (error.code === '42501') {
        throw new Error("Database permission error - RLS policy issue")
      } else if (error.code === '23505') {
        throw new Error("Email already exists")
      } else {
        throw new Error(`Database error: ${error.message}`)
      }
    }

    // Log successful lead capture
    await logActivity({
      type: 'lead_captured',
      title: 'Lead Captured',
      description: `New lead captured via ${leadData.engagementType}`,
      status: 'completed',
      metadata: {
        email: leadData.email,
        name: leadData.name,
        company: leadData.company,
        engagementType: leadData.engagementType,
        leadId: data.id,
        timestamp: new Date().toISOString()
      }
    })

    // Trigger AI research in background (only if in development or with full URL)
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXTAUTH_URL 
        ? process.env.NEXTAUTH_URL 
        : process.env.NODE_ENV === "development" 
        ? "http://localhost:3000" 
        : null

      if (baseUrl) {
        fetch(`${baseUrl}/api/lead-research`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: leadData.name,
            email: leadData.email,
            company: leadData.company,
          }),
        }).catch(error => {
          console.log("Background research fetch failed:", error.message)
        })
      }
    } catch (error) {
      console.log("Background research fetch skipped:", error)
    }

    return NextResponse.json({
      success: true,
      leadId: data.id,
      message: "Lead captured successfully",
    })
  } catch (error: any) {
    console.error("Lead capture error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to process lead capture",
      details: error.details || null
    }, { status: 500 })
  }
}
