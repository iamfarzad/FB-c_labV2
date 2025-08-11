import { NextRequest, NextResponse } from 'next/server'
import { ContextStorage } from '@/lib/context/context-storage'
import { LeadResearchService } from '@/lib/intelligence/lead-research'
import { getSupabase } from '@/lib/supabase/server'

const contextStorage = new ContextStorage()
const leadResearchService = new LeadResearchService()

// In-flight dedupe for concurrent research per session (best-effort, dev-friendly)
const researchInFlight = new Map<string, Promise<any>>()

function hasResearch(context: any) {
  return Boolean(
    context && (
      context.company_context || context.person_context || context.role || context.role_confidence != null
    )
  )
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId: providedSessionId, email, name, companyUrl } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Missing required field: email' },
        { status: 400 }
      )
    }

    // Idempotency: prefer unified header, fallback to legacy; else generate
    const headerSession = req.headers.get('x-intelligence-session-id') || undefined
    const sessionId = providedSessionId || headerSession || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    // Upsert minimal conversation context row (ensures row exists)
    try {
      const supabase = getSupabase()
      await supabase
        .from('conversation_contexts')
        .upsert({
          session_id: String(sessionId),
          email: String(email),
          name: name ? String(name) : null,
          company_url: companyUrl ? String(companyUrl) : null,
        }, { onConflict: 'session_id' })
    } catch {}

    console.log('🎯 Session init started:', { sessionId, email, name, companyUrl })

    // Check for existing context for idempotency
    const existing = await contextStorage.get(sessionId)

    // If no record yet, persist the bare identifiers
    if (!existing) {
      await contextStorage.store(sessionId, {
        email,
        name,
        company_url: companyUrl
      })
    } else {
      // If the identifiers changed, update only those fields (do not clobber researched context)
      const needsIdUpdate =
        (email && existing.email !== email) ||
        (name && existing.name !== name) ||
        (companyUrl && existing.company_url !== companyUrl)

      if (needsIdUpdate) {
        await contextStorage.update(sessionId, {
          email: email ?? existing.email,
          name: name ?? existing.name,
          company_url: companyUrl ?? existing.company_url
        })
      }

      // If we already have research for this session, short‑circuit and return it
      if (hasResearch(existing)) {
        const snapshot = {
          company: existing.company_context ?? null,
          person: existing.person_context ?? null,
          role: existing.role ?? null,
          roleConfidence: existing.role_confidence ?? null,
        }

        const response = {
          sessionId,
          contextReady: true,
          snapshot,
        }

        console.log('✅ Session init idempotent: returning existing context', response)
        return NextResponse.json(response, { headers: { 'X-Session-Id': sessionId, 'Cache-Control': 'no-store' } })
      }
    }

    // Start lead research (async; but do not duplicate if already have research)
    let contextReady = false
    let researchResult: any = null

    try {
      if (!hasResearch(existing)) {
        console.log('🔍 Starting lead research for:', email)
        if (!researchInFlight.has(sessionId)) {
          const p = leadResearchService
            .researchLead(email, name, companyUrl, sessionId)
            .finally(() => researchInFlight.delete(sessionId))
          researchInFlight.set(sessionId, p)
        }
        researchResult = await researchInFlight.get(sessionId)!
      }
      
      // Update context with research results when available
      if (researchResult) {
        await contextStorage.update(sessionId, {
          company_context: researchResult.company,
          person_context: researchResult.person,
          role: researchResult.role,
          role_confidence: researchResult.confidence
        })
      }

      contextReady = researchResult != null || hasResearch(existing)
      console.log('✅ Lead research completed, context ready')
      
    } catch (error) {
      console.error('❌ Lead research failed:', error)
      // Continue without research results
      contextReady = false
    }

    // Return session info
    // Build snapshot from research result if present; otherwise from stored context (if any)
    const afterContext = await contextStorage.get(sessionId)
    const response = {
      sessionId,
      contextReady,
      snapshot: researchResult
        ? {
            company: researchResult.company,
            person: researchResult.person,
            role: researchResult.role,
            roleConfidence: researchResult.confidence,
          }
        : afterContext && hasResearch(afterContext)
        ? {
            company: afterContext?.company_context ?? null,
            person: afterContext?.person_context ?? null,
            role: afterContext?.role ?? null,
            roleConfidence: afterContext?.role_confidence ?? null,
          }
        : null,
    }

    console.log('✅ Session init completed:', response)
    return NextResponse.json(response, { headers: { 'X-Session-Id': sessionId, 'Cache-Control': 'no-store' } })

  } catch (error) {
    console.error('❌ Session init failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
