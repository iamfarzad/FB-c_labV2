"use client"

import React, { useCallback, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"

export interface StageItem {
  id: string
  label: string
  done?: boolean
  current?: boolean
  onClick: () => void
}

interface RightStageRailProps {
  stages: StageItem[]
  className?: string
  ariaLabel?: string
}

export function RightStageRail({ stages, className, ariaLabel = "Conversation stages" }: RightStageRailProps) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])

  const activeIndex = useMemo(() => stages.findIndex(s => s.current) ?? 0, [stages])

  const focusIndex = useCallback((idx: number) => {
    const btn = buttonsRef.current[idx]
    if (btn) btn.focus()
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = stages.length
    if (count === 0) return
    const current = document.activeElement
    const currentIdx = buttonsRef.current.findIndex(b => b === current)
    let nextIdx = currentIdx >= 0 ? currentIdx : (activeIndex >= 0 ? activeIndex : 0)
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(); nextIdx = (nextIdx + 1) % count; focusIndex(nextIdx); break
      case "ArrowUp":
        e.preventDefault(); nextIdx = (nextIdx - 1 + count) % count; focusIndex(nextIdx); break
      case "Home":
        e.preventDefault(); focusIndex(0); break
      case "End":
        e.preventDefault(); focusIndex(count - 1); break
      case "Enter":
      case " ":
        if (currentIdx >= 0) { e.preventDefault(); const s = stages[currentIdx]; if (s) s.onClick() }
        break
    }
  }, [stages, activeIndex, focusIndex])

  return (
    <div className={cn("h-full p-3", className)} role="navigation" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      <ol className="space-y-2">
        {stages.map((s, idx) => (
          <li key={s.id}>
            <button
              ref={el => (buttonsRef.current[idx] = el)}
              type="button"
              onClick={s.onClick}
              aria-current={s.current ? "step" : undefined}
              aria-label={s.label}
              className={cn(
                "w-full text-left rounded-lg border p-3 transition min-h-[44px]",
                s.current ? "border-[var(--color-orange-accent)]/40 bg-[var(--color-orange-accent)]/10" : "border-border/40 hover:bg-card/70",
                s.done && "opacity-90"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  s.done ? "bg-green-500" : s.current ? "bg-[var(--color-orange-accent)]" : "bg-muted-foreground/40"
                )} />
                <span className="text-sm">{s.label}</span>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}


