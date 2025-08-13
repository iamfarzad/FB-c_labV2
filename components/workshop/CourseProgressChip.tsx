"use client"

import { useEffect, useMemo, useState } from 'react'
import { WORKSHOP_MODULES } from '@/components/workshop/education-modules'
import { cn } from '@/lib/utils'

type Stored = { completed: Array<{ moduleId: string; stepId: string }>; xp: number; badges: string[] }
const STORAGE_KEY = 'fbc_education_progress_v1'

export function CourseProgressChip({ className }: { className?: string }) {
  const [state, setState] = useState<Stored>({ completed: [], xp: 0, badges: [] })
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setState(JSON.parse(raw))
    } catch {}
  }, [])

  const totalSteps = useMemo(() => WORKSHOP_MODULES.reduce((sum, m) => sum + m.steps.length, 0), [])
  const doneSteps = useMemo(() => state.completed.length, [state.completed])

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/70 px-3 py-1 text-sm backdrop-blur-md shadow-sm',
      className
    )}>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold">
        {doneSteps}
      </span>
      <span className="text-muted-foreground">Course</span>
      <span className="font-medium text-primary">{doneSteps}/{totalSteps}</span>
    </div>
  )
}

export default CourseProgressChip


