import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSupabase } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

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

    // LOGIC: Use Google GenAI with web search capabilities
    // WHY: Lead research requires real-time web data, not just training data
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // Use a more powerful model for research tasks
      tools: [
        {
          googleSearch: {}, // Correctly enable Google Search
        },
      ],
    })

    // LOGIC: Comprehensive research prompt
    // WHY: Structured research approach for actionable business insights
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

    // LOGIC: Stream research process
    // WHY: Research takes time, streaming shows progress to user
    const response = await model.generateContentStream(researchPrompt)

    // LOGIC: Server-sent events for research progress
    // WHY: Real-time feedback during lengthy research process
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

          // LOGIC: Save research to database when complete
          // WHY: Persist research for future reference and lead management
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// LOGIC: Extract key insights for consultant
// WHY: Summarize research into actionable points
function extractConsultantBrief(research: string): string {
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

// LOGIC: Calculate lead quality score
// WHY: Prioritize leads based on AI readiness indicators
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

// LOGIC: Extract relevant AI capabilities
// WHY: Match AI solutions to lead's specific needs
function extractAICapabilities(research: string): string[] {
  const capabilities = []

  if (research.toLowerCase().includes("chatbot")) capabilities.push("Chatbot Development")
  if (research.toLowerCase().includes("automation")) capabilities.push("Process Automation")
  if (research.toLowerCase().includes("data analysis")) capabilities.push("Data Analytics")
  if (research.toLowerCase().includes("personalization")) capabilities.push("Personalization Engine")
  if (research.toLowerCase().includes("content")) capabilities.push("Content Generation")

  return capabilities
}
