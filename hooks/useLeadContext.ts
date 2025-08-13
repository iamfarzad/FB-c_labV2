import { useEffect, useState } from 'react'

export interface LeadContextSnapshot {
  sessionId: string
  lead?: { email: string; name?: string }
  company?: any
  person?: any
  role?: string
  roleConfidence?: number
  intent?: any
  ai_capabilities_shown?: string[]
}

export function useLeadContext(sessionId?: string) {
  const [snapshot, setSnapshot] = useState<LeadContextSnapshot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!sessionId) return
    setLoading(true)
    fetch(`/api/intelligence/context?sessionId=${encodeURIComponent(sessionId)}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('context failed')))
      .then(data => { if (!cancelled) setSnapshot(data) })
      .catch(e => { if (!cancelled) setError(String(e.message || e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [sessionId])

  return { snapshot, loading, error }
}

import { useEffect, useState } from 'react'

interface LeadContextState {
  sessionId?: string
  snapshot?: any
  isLoading: boolean
}

export function useLeadContext(sessionId?: string) {
  const [state, setState] = useState<LeadContextState>({ isLoading: false })

  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setState(s => ({ ...s, isLoading: true }))
    fetch(`/api/intelligence/context?sessionId=${encodeURIComponent(sessionId)}`, {
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => { if (!cancelled) setState({ sessionId, snapshot: data, isLoading: false }) })
      .catch(() => { if (!cancelled) setState(s => ({ ...s, isLoading: false })) })
    return () => { cancelled = true }
  }, [sessionId])

  return state
}


