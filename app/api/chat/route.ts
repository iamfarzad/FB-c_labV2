import { unifiedAIService } from '@/lib/unified-ai-service'
import { getSupabase } from "@/lib/supabase/server"
import { TokenCostCalculator } from "@/lib/token-cost-calculator"
import type { NextRequest } from "next/server"

// Define Message type locally since ai package exports are not available
interface Message {
  role: "user" | "assistant"
  content: string
  imageUrl?: string
}

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { messages, data = {} } = await req.json()
    const { leadContext = {}, sessionId = null, userId = null } = data

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }

    const stream = await unifiedAIService.sendChatMessage(messages, data)
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
    
  } catch (error: any) {
    console.error("[Chat API Error]", error)
    const status = error.status || 500
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred." }), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }
}
