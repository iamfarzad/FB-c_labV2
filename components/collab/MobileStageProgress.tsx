"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface MobileStageProgressProps {
  stages: Array<{ id: string; label: string; done?: boolean; current?: boolean }>
  className?: string
}

export function MobileStageProgress({ stages, className }: MobileStageProgressProps) {
  const total = stages.length || 1
  const idx = Math.max(0, stages.findIndex(s => s.current))
  const progress = Math.round(((idx + 1) / total) * 100)

  return (
    <div className={cn("md:hidden border-b bg-background/80 backdrop-blur", className)} aria-label="Stage progress">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{stages[idx]?.label || stages[0]?.label || 'Progress'}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-muted/60 overflow-hidden">
          <div className="h-full rounded-full bg-[var(--color-orange-accent)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}


