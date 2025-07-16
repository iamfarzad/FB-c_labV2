import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { leadCaptureSchema, validateRequest, sanitizeString, sanitizeEmail } from "@/lib/validation"

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
    const rawData = await req.json()
    
    // Validate input data
    const validation = validateRequest(leadCaptureSchema, rawData)
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 })
    }
    
    // Sanitize the validated data
    const leadData: LeadCaptureData = {
      name: sanitizeString(validation.data.name),
      email: sanitizeEmail(validation.data.email),
      company: validation.data.company_name ? sanitizeString(validation.data.company_name) : undefined,
      engagementType: "chat", // Default for now
      initialQuery: validation.data.message ? sanitizeString(validation.data.message) : undefined,
      tcAcceptance: {
        accepted: true,
        timestamp: Date.now()
      }
    }

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
