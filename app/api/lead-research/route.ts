import { GoogleGenAI } from "@google/genai"
import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { logServerActivity } from '@/lib/server-activity-logger';

interface LeadResearchRequest {
  name: string
  email: string
  company?: string
  linkedinUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, linkedinUrl }: LeadResearchRequest = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Log research start
    await logServerActivity({
      type: "search",
      title: "AI Research in Progress",
      description: `Searching for ${name}'s business background`,
      status: "in_progress",
      metadata: { name, email, company }
    })

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    })

    const tools = [
      { urlContext: {} }, // Enable web search
    ]

    const config = {
      thinkingConfig: {
        thinkingBudget: -1, // Unlimited thinking time for thorough research
      },
      tools,
      responseMimeType: "text/plain",
    }

    const model = "gemini-2.5-flash"

    const researchPrompt = `
I need you to research ${name} with email ${email}${company ? ` from company ${company}` : ""}${linkedinUrl ? ` (LinkedIn: ${linkedinUrl})` : ""}.

Please:
1. Search Google and LinkedIn for this person
2. Identify their role, company, and industry
3. Analyze their business challenges and pain points
4. Suggest specific AI automation opportunities for their industry
5. Create a personalized outreach strategy

Focus on finding actionable insights for AI consulting opportunities.
`

    const contents = [
      {
        role: "user",
        parts: [{ text: researchPrompt }],
      },
    ]

    // Stream the research process
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    // Create streaming response to show research progress
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResearch = ""

          for await (const chunk of response) {
            const text = chunk.text
            if (text) {
              fullResearch += text
              // Send progress updates
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    content: text,
                  })}\n\n`,
                ),
              )
            }
          }

          // Log research completion
          await logServerActivity({
            type: "search",
            title: "Lead Research Completed",
            description: `Completed research for ${name}`,
            status: "completed",
            metadata: { 
              name, 
              email, 
              company,
              researchLength: fullResearch.length 
            }
          })

          // Save to Supabase when complete
          const supabase = getSupabase()
          await supabase.from("lead_summaries").insert({
            name,
            email,
            company_name: company,
            conversation_summary: fullResearch,
            consultant_brief: extractConsultantBrief(fullResearch),
            lead_score: calculateLeadScore(fullResearch),
            ai_capabilities_shown: extractAICapabilities(fullResearch),
          })

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                research: fullResearch,
              })}\n\n`,
            ),
          )

          controller.close()
        } catch (error) {
          console.error("Research streaming error:", error)
          
          // Log research error
          await logServerActivity({
            type: "error",
            title: "Lead Research Failed",
            description: `Research failed for ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            status: "failed",
            metadata: { name, email, company, error: error instanceof Error ? error.message : 'Unknown error' }
          })
          
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("Lead research error:", error)
    
    // Log research error
    await logServerActivity({
      type: "error",
      title: "Lead Research Failed",
      description: `Research failed: ${error.message}`,
      status: "failed",
      metadata: { error: error.message }
    })
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function extractConsultantBrief(research: string): string {
  // Extract key points for consultant
  const lines = research.split("\n")
  const briefPoints = lines.filter(
    (line) =>
      line.includes("pain point") ||
      line.includes("opportunity") ||
      line.includes("automation") ||
      line.includes("challenge"),
  )
  return briefPoints.slice(0, 5).join("\n")
}

function calculateLeadScore(research: string): number {
  let score = 0

  // Score based on AI readiness indicators
  if (research.toLowerCase().includes("technology")) score += 20
  if (research.toLowerCase().includes("automation")) score += 25
  if (research.toLowerCase().includes("ai") || research.toLowerCase().includes("artificial intelligence")) score += 30
  if (research.toLowerCase().includes("scale") || research.toLowerCase().includes("growth")) score += 15
  if (research.toLowerCase().includes("efficiency")) score += 10

  return Math.min(score, 100)
}

function extractAICapabilities(research: string): string[] {
  const capabilities = []

  if (research.toLowerCase().includes("chatbot")) capabilities.push("Chatbot Development")
  if (research.toLowerCase().includes("automation")) capabilities.push("Process Automation")
  if (research.toLowerCase().includes("data analysis")) capabilities.push("Data Analytics")
  if (research.toLowerCase().includes("personalization")) capabilities.push("Personalization Engine")
  if (research.toLowerCase().includes("content")) capabilities.push("Content Generation")

  return capabilities
}
