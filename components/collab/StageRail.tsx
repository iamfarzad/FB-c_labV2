"use client"

import React, { useEffect, useState } from "react"

type Context = { stage?: number; exploredCount?: number; total?: number }

export function StageRail({ sessionId }: { sessionId?: string }) {
  const [ctx, setCtx] = useState<Context>({ stage: 1, exploredCount: 0, total: 16 })

  useEffect(() => {
    let cancelled = false
    const id = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('intelligence-session-id') || undefined : undefined)
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/intelligence/context?sessionId=${id}`, { cache: 'no-store' })
        if (!res.ok) return
        const j = await res.json()
        const out = j?.output || j
        const stage = Number(out?.stage || 1)
        const explored = Number(out?.exploredCount || out?.capabilities?.length || 0)
        setCtx({ stage, exploredCount: explored, total: 16 })
      } catch {}
    })()
    return () => { cancelled = true }
  }, [sessionId])

  return (
    <div className="fixed right-4 top-24 z-30 flex flex-col items-center gap-3">
      <div className="text-xs text-muted-foreground">STAGE {ctx.stage}/7</div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className={`w-10 h-10 rounded-full grid place-items-center ${i + 1 <= (ctx.stage || 1) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
      ))}
      <div className="text-[10px] text-muted-foreground mt-2">{ctx.exploredCount}/{ctx.total} explored</div>
    </div>
  )
}


