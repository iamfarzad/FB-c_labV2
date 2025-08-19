"use client"

import React, { useMemo, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface LeftToolItem {
  id: string
  icon: React.ReactNode
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}

interface LeftToolRailProps {
  items: LeftToolItem[]
  className?: string
  ariaLabel?: string
}

export function LeftToolRail({ items, className, ariaLabel = "Primary tools" }: LeftToolRailProps) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])

  const focusIndex = useCallback((idx: number) => {
    const btn = buttonsRef.current[idx]
    if (btn) btn.focus()
  }, [])

  const activeIndex = useMemo(() => {
    const i = items.findIndex(i => i.active)
    return i >= 0 ? i : 0
  }, [items])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const count = items.length
    if (count === 0) return
    const current = document.activeElement
    const currentIdx = buttonsRef.current.findIndex(b => b === current)
    let nextIdx = currentIdx >= 0 ? currentIdx : activeIndex
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault()
        nextIdx = (nextIdx + 1 + count) % count
        focusIndex(nextIdx)
        break
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault()
        nextIdx = (nextIdx - 1 + count) % count
        focusIndex(nextIdx)
        break
      case "Home":
        e.preventDefault()
        focusIndex(0)
        break
      case "End":
        e.preventDefault()
        focusIndex(count - 1)
        break
      case "Enter":
      case " ":
        if (currentIdx >= 0) {
          e.preventDefault()
          const item = items[currentIdx]
          if (item && !item.disabled) item.onClick()
        }
        break
    }
  }, [items, activeIndex, focusIndex])

  return (
    <TooltipProvider>
      <div
        role="navigation"
        aria-label={ariaLabel}
        className={cn("flex flex-col items-center gap-2 p-2", className)}
        onKeyDown={onKeyDown}
      >
        {items.map((item, idx) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                ref={el => (buttonsRef.current[idx] = el)}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                disabled={item.disabled}
                onClick={item.onClick}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange-accent)]/40 focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0",
                  item.active
                    ? "bg-[var(--color-orange-accent)]/10 border-[var(--color-orange-accent)]/30 text-[var(--color-orange-accent)]"
                    : "bg-card/60 border-border/40 text-muted-foreground hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="relative">
                  <span aria-hidden>{item.icon}</span>
                  {item.active && (
                    <span className="absolute -right-1 -bottom-1 inline-block h-2 w-2 rounded-full bg-[var(--color-orange-accent)] shadow-[0_0_6px_var(--color-orange-accent)]" aria-hidden />
                  )}
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}


