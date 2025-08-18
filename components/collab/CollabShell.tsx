"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface CollabShellProps {
  left?: React.ReactNode
  header?: React.ReactNode
  center?: React.ReactNode
  right?: React.ReactNode
  dock?: React.ReactNode
  className?: string
}

export function CollabShell({ left, header, center, right, dock, className }: CollabShellProps) {
  return (
    <div
      className={cn(
        "h-dvh grid grid-rows-[auto_1fr_auto] md:grid-rows-[auto_1fr] md:grid-cols-[56px_1fr_320px] bg-background text-foreground",
        className
      )}
    >
      {/* Header row (spans center + right on desktop) */}
      <div className="col-span-full md:col-start-2 md:col-end-4">{header}</div>

      {/* Left rail */}
      <aside className="hidden md:block border-r bg-card/40">{left}</aside>

      {/* Center content */}
      <main className="min-h-0 overflow-hidden">{center}</main>

      {/* Right rail */}
      <aside className="hidden md:block border-l bg-card/30">{right}</aside>

      {/* Bottom dock (spans center + right on desktop) */}
      <div className="col-span-full md:col-start-2 md:col-end-4">{dock}</div>
    </div>
  )
}


