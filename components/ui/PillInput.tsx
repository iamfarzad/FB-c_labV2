"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PillInputProps {
  value: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  className?: string
  disabled?: boolean
  waveformChip?: React.ReactNode
}

export function PillInput({
  value,
  placeholder,
  onChange,
  onKeyDown,
  onSubmit,
  leftSlot,
  rightSlot,
  className,
  disabled,
  waveformChip,
}: PillInputProps) {
  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex items-center gap-2 rounded-full border bg-card/70 backdrop-blur-md",
          "px-3 py-2 md:py-2.5",
          "transition-colors",
          "focus-within:border-accent focus-within:shadow-[0_0_0_2px_hsl(var(--accent)/0.08)]"
        )}
      >
        {leftSlot ? (
          <div className="shrink-0 flex items-center gap-2">{leftSlot}{waveformChip}</div>
        ) : waveformChip ? (
          <div className="shrink-0">{waveformChip}</div>
        ) : null}

        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent outline-none overflow-hidden",
            "min-h-[28px] md:min-h-[32px] text-base leading-relaxed",
            "placeholder:text-muted-foreground/60"
          )}
        />

        {rightSlot ? (
          <div className="shrink-0 flex items-center gap-1">{rightSlot}</div>
        ) : null}
      </div>
    </form>
  )
}

export default PillInput


