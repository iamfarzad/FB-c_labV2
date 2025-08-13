import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ContextStorage } from '@/lib/context/context-storage'
import type { ContextSnapshot, IntentResult } from '@/types/intelligence'
import { suggestTools } from '@/lib/intelligence/tool-suggestion-engine'
import { withApiGuard } from '@/lib/api/withApiGuard'

const contextStorage = new ContextStorage()

const Body = z.object({ sessionId: z.string().min(1), stage: z.string().optional() })

export const POST = withApiGuard({ schema: Body, requireSession: false, rateLimit: { windowMs: 3000, max: 5 }, handler: async ({ body }) => {
  const raw = await contextStorage.get(body.sessionId)
  if (!raw) return NextResponse.json({ ok: false, error: 'Context not found' }, { status: 404 })
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
  // Heuristic: if last user input (stored in context) contained a YouTube URL, ensure video2app suggestion is present
  try {
    const lastUser = (raw?.last_user_message || '').toString()
    const yt = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    if (yt.test(lastUser) && !suggestions.some(s => s.capability === 'video2app')) {
      suggestions.unshift({ id: 'video2app', label: 'Turn video into app blueprint', action: 'run_tool', capability: 'video2app' })
    }
  } catch {}
  return NextResponse.json({ ok: true, suggestions })
}})


