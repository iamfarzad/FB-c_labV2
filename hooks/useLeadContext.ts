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


