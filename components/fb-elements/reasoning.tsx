"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function Reasoning({
  children,
  defaultOpen = false,
  isStreaming = false,
  duration,
  className,
}: ReasoningProps) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen)

  return (
    <div className={cn("rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-2 text-xs font-medium",
            "text-accent hover:text-accent/90"
          )}
        >
          <span className="relative">
            <span className="mr-1">Reasoning</span>
            {typeof duration === "number" && (
              <span className="ml-1 text-[10px] text-muted-foreground align-middle">{duration}s</span>
            )}
          </span>
          <svg
            className={cn("h-3.5 w-3.5 transition-transform", open ? "rotate-180" : "rotate-0")}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isStreaming && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            thinking…
          </div>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3">
          <div className="rounded-md border border-border/30 bg-muted/20 p-3 text-xs text-foreground/80 space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export function ReasoningTrigger({ className, children }: ReasoningTriggerProps) {
  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {children ?? "Show thinking"}
    </div>
  )
}

export function ReasoningContent({ className, children }: ReasoningContentProps) {
  return <div className={cn("whitespace-pre-wrap leading-relaxed", className)}>{children}</div>
}

// Types last
interface ReasoningProps {
  children: React.ReactNode
  defaultOpen?: boolean
  isStreaming?: boolean
  duration?: number
  className?: string
}

interface ReasoningTriggerProps {
  children?: React.ReactNode
  className?: string
}

interface ReasoningContentProps {
  children: React.ReactNode
  className?: string
}


