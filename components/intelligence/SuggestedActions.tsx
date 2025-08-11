'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Suggestion } from '@/types/intelligence'

interface Props {
  sessionId?: string | null
  stage?: 'GREETING' | 'INTENT' | 'QUALIFY' | 'ACTION'
  onRun?: (s: Suggestion) => void
}

export function SuggestedActions({ sessionId, stage = 'INTENT', onRun }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [refreshTick, setRefreshTick] = useState(0)

  // Refetch when capabilities are used (server updates context)
  useEffect(() => {
    const onUsed = () => setRefreshTick((x) => x + 1)
    try { window.addEventListener('chat-capability-used', onUsed as EventListener) } catch {}
    return () => {
      try { window.removeEventListener('chat-capability-used', onUsed as EventListener) } catch {}
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!sessionId) return
      setIsLoading(true)
      try {
        const res = await fetch('/api/intelligence/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, stage }),
        })
        if (!res.ok) throw new Error('failed')
        const j = await res.json()
        if (!cancelled) setSuggestions(j.suggestions || [])
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [sessionId, stage, refreshTick])

  if (!sessionId) return null
  if (isLoading && suggestions.length === 0) return null
  if (suggestions.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {suggestions.map(s => (
        <Button
          key={s.id}
          size="sm"
          variant={s.capability === 'exportPdf' ? 'default' : 'outline'}
          onClick={() => onRun?.(s)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  )
}

export default SuggestedActions


