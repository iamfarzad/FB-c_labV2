"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export interface QuickActionItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

interface QuickActionsRowProps {
  actions: QuickActionItem[]
  className?: string
}

export function QuickActionsRow({ actions, className }: QuickActionsRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      {actions.map(a => (
        <button
          key={a.id}
          type="button"
          onClick={a.onClick}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange-accent)]/40 focus-visible:ring-offset-2",
            "border-border/40 bg-card/60 text-foreground hover:bg-[var(--color-orange-accent)]/10 hover:border-[var(--color-orange-accent)]/30 hover:text-[var(--color-orange-accent)]"
          )}
          aria-label={a.label}
        >
          {a.icon}
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  )
}


