"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressDotsProps {
  total: number
  active: number // 0-indexed
  className?: string
}

export function ProgressDots({ total, active, className }: ProgressDotsProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === active
        const isCompleted = idx < active
        return (
          <div
            key={idx}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isActive ? "bg-[hsl(var(--accent))]" : isCompleted ? "bg-muted" : "bg-border"
            )}
          />
        )
      })}
    </div>
  )
}

export default ProgressDots


