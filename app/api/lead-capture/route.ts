import { LeadManagementService } from "@/lib/lead-management"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { leadCaptureSchema, validateRequest, sanitizeString, sanitizeEmail } from "@/lib/validation"
import { logActivity } from "@/lib/activity-logger"
import { GroundedSearchService } from "@/lib/grounded-search-service"

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

    // Log lead capture activity
    await logActivity({
      type: "lead_capture",
      title: "New Lead Captured",
      description: `${leadData.name} (${leadData.email}) engaged via ${leadData.engagementType}`,
      status: "completed",
      metadata: {
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        engagementType: leadData.engagementType,
        initialQuery: leadData.initialQuery
      }
    })

    // Use the new LeadManagementService
    const leadManagementService = new LeadManagementService()

    // Prepare data for lead_summaries table
    const leadRecord = {
      name: leadData.name,
      email: leadData.email,
      company_name: leadData.company || undefined,
      conversation_summary: `Initial engagement via ${leadData.engagementType}${leadData.initialQuery ? `: "${leadData.initialQuery}"` : ""}`,
      consultant_brief: `New lead captured via ${leadData.engagementType}. TC accepted at ${leadData.tcAcceptance?.timestamp ? new Date(leadData.tcAcceptance.timestamp).toISOString() : new Date().toISOString()}`,
      lead_score: 50,
      ai_capabilities_shown: [leadData.engagementType]
    }

    // Save lead using the service
    const data = await leadManagementService.createLeadSummary(leadRecord)

    // ✅ NEW: Perform grounded search for the lead
    let searchResults: Array<{ url: string; title?: string; snippet?: string; source: string }> = []
    try {
      const groundedSearchService = new GroundedSearchService()
      
      searchResults = await groundedSearchService.searchLead({
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        sources: ['linkedin.com', 'google.com'],
        leadId: data.id
      })

      console.log(`Found ${searchResults.length} search results for ${leadData.name}`)

    } catch (searchError) {
      console.error('Grounded search failed:', searchError)
      // Don't fail the entire request if search fails
      await logActivity({
        type: "error",
        title: "Grounded Search Failed",
        description: `Search failed for ${leadData.name}: ${searchError instanceof Error ? searchError.message : 'Unknown error'}`,
        status: "failed",
        metadata: { 
          name: leadData.name, 
          email: leadData.email, 
          company: leadData.company,
          error: searchError instanceof Error ? searchError.message : 'Unknown error'
        }
      })
    }

    // Log lead research start
    await logActivity({
      type: "search",
      title: "Lead Research Started",
      description: `Researching ${leadData.name} for business insights`,
      status: "in_progress",
      metadata: {
        name: leadData.name,
        email: leadData.email,
        company: leadData.company,
        searchResultsCount: searchResults.length
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
          // Log research failure
          logActivity({
            type: "error",
            title: "Lead Research Failed",
            description: `Failed to research ${leadData.name}: ${error.message}`,
            status: "failed",
            metadata: { name: leadData.name, error: error.message }
          })
        })
      }
    } catch (error) {
      console.log("Background research fetch skipped:", error)
    }

    return NextResponse.json({
      success: true,
      leadId: data.id,
      message: "Lead captured successfully",
      searchResults: searchResults.length,
      searchResultsData: searchResults // Include actual search results
    })
  } catch (error: any) {
    console.error("Lead capture error:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to process lead capture",
      details: error.details || null
    }, { status: 500 })
  }
}
