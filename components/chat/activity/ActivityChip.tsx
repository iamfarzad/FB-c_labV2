"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface ActivityChipProps {
  direction: "in" | "out"
  label: string
  className?: string
}

export function ActivityChip({ direction, label, className }: ActivityChipProps) {
  const colorClasses = direction === "in"
    ? "bg-[hsl(var(--chart-success))]/10 text-[hsl(var(--chart-success))] border-[hsl(var(--chart-success))]/20"
    : "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/20"

  const prefix = direction === "in" ? "IN" : "OUT"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border",
        "whitespace-nowrap select-none",
        colorClasses,
        className
      )}
    >
      <span className="font-semibold opacity-80">{prefix}</span>
      <span className="opacity-90">{label}</span>
    </span>
  )
}


