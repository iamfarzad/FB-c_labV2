import { useState, useCallback, useRef } from 'react'

export interface IntelligenceContext {
  lead: { email: string; name: string }
  company?: {
    name: string
    size: string
    domain: string
    summary: string
    website: string
    industry: string
    linkedin: string
  }
  person?: {
    role: string
    company: string
    fullName: string
    seniority: string
    profileUrl: string
  }
  role?: string
  roleConfidence?: number
  intent?: { type: string; confidence: number; slots: any }
  capabilities: string[]
}

// --- Client-side request de-dupe + TTL cache ---
// Prevents repeated fetches that inflate API cost when multiple components mount/rerender.
const INFLIGHT = new Map<string, Promise<void>>()
const LAST_FETCH_AT = new Map<string, number>()
const TTL_MS_DEFAULT = 30_000 // 30s; adjust via fetchContext({ ttlMs })

function jsonHash(o: unknown): string {
  try { return JSON.stringify(o) } catch { return '' }
}

export function useConversationalIntelligence() {
  const [context, setContext] = useState<IntelligenceContext | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSessionIdRef = useRef<string | null>(null)
  const lastHashRef = useRef<string | null>(null)

  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('intelligence-session-id')
  }, [])

  /**
   * Fetch context once per TTL per session, with in-flight coalescing.
   * Pass { force: true } to ignore TTL. Pass { ttlMs } to override TTL.
   */
  const fetchContext = useCallback(
    async (
      sessionId: string,
      opts?: { force?: boolean; ttlMs?: number }
    ): Promise<void> => {
      if (!sessionId) return
      const ttlMs = opts?.ttlMs ?? TTL_MS_DEFAULT
      const now = Date.now()
      const lastAt = LAST_FETCH_AT.get(sessionId) || 0

      // TTL guard
      if (!opts?.force && now - lastAt < ttlMs) return

      // If a request is already in-flight for this session, reuse it
      const inflight = INFLIGHT.get(sessionId)
      if (inflight) return inflight

      setIsLoading(true)
      setError(null)

      const p = (async () => {
        try {
          // Always avoid browser cache for correctness; TTL handles throttling
          const response = await fetch(`/api/intelligence/context?sessionId=${sessionId}`, { cache: 'no-store' })
          if (!response.ok) throw new Error('Failed to fetch context')
          const data = (await response.json()) as IntelligenceContext

          // Skip state update if content is unchanged to avoid extra rerenders
          const h = jsonHash(data)
          if (lastHashRef.current !== h) {
            setContext(data)
            lastHashRef.current = h
          }

          LAST_FETCH_AT.set(sessionId, Date.now())
          lastSessionIdRef.current = sessionId
        } catch (err) {
          setError('Failed to fetch context')
          console.error('Context fetch error:', err)
        } finally {
          setIsLoading(false)
          INFLIGHT.delete(sessionId)
        }
      })()

      INFLIGHT.set(sessionId, p)
      return p
    },
    []
  )

  const generatePersonalizedGreeting = useCallback((ctx: IntelligenceContext | null): string => {
    if (!ctx) return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"

    const { company, person, role, roleConfidence } = ctx
    const industry = company?.industry ? company.industry.toLowerCase() : undefined

    if (roleConfidence && roleConfidence >= 0.7 && company && person) {
      return `Hi ${person.fullName} at ${company.name}! As ${role}, I can help you explore AI capabilities for your ${industry ?? 'business'}. What would you like to work on today?`
    }
    if (company && person) {
      return `Hi ${person.fullName} at ${company.name}! I can help you explore AI capabilities for your ${industry ?? 'business'}. What would you like to work on today?`
    }
    if (person) {
      return `Hi ${person.fullName}! I'm here to help you explore AI capabilities. What would you like to work on today?`
    }
    return "Hi! I'm here to help you explore AI capabilities. What would you like to work on today?"
  }, [])

  /** Optional convenience: fetch once using stored session id with TTL **/
  const fetchContextFromLocalSession = useCallback(async (opts?: { force?: boolean; ttlMs?: number }) => {
    const sid = getSessionId()
    if (sid) await fetchContext(sid, opts)
  }, [getSessionId, fetchContext])

  /** Allow manual cache reset (e.g., after consent or stage change) **/
  const clearContextCache = useCallback((sessionId?: string) => {
    if (sessionId) {
      LAST_FETCH_AT.delete(sessionId)
      INFLIGHT.delete(sessionId)
    } else if (lastSessionIdRef.current) {
      LAST_FETCH_AT.delete(lastSessionIdRef.current)
      INFLIGHT.delete(lastSessionIdRef.current)
    }
  }, [])

  return {
    context,
    isLoading,
    error,
    getSessionId,
    fetchContext,
    fetchContextFromLocalSession,
    clearContextCache,
    generatePersonalizedGreeting,
  }
}
