import { NextRequest, NextResponse } from 'next/server'
import { ContextStorage } from '@/lib/context/context-storage'
import type { ContextSnapshot, IntentResult } from '@/types/intelligence'
import { suggestTools } from '@/lib/intelligence/tool-suggestion-engine'

const contextStorage = new ContextStorage()

export async function POST(req: NextRequest) {
  try {
    const { sessionId, stage } = await req.json()
    if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

    const raw = await contextStorage.get(sessionId)
    if (!raw) return NextResponse.json({ error: 'Context not found' }, { status: 404 })

    const snapshot: ContextSnapshot = {
      lead: { email: raw.email, name: raw.name },
      company: raw.company_context ?? undefined,
      person: raw.person_context ?? undefined,
      role: raw.role ?? undefined,
      roleConfidence: raw.role_confidence ?? undefined,
      intent: raw.intent_data ?? undefined,
      capabilities: raw.ai_capabilities_shown || [],
    }

    const intent: IntentResult = snapshot.intent || { type: 'other', confidence: 0.4, slots: {} }
    const suggestions = suggestTools(snapshot, intent)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('❌ Suggestions failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


