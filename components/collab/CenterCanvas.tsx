"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export type CanvasState = "empty" | "webcam" | "screen" | "video" | "pdf"

interface CenterCanvasProps {
  state: CanvasState
  empty?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function CenterCanvas({ state, empty, children, className }: CenterCanvasProps) {
  return (
    <div className={cn("h-full p-4 md:p-6", className)}>
      <div className="h-full rounded-xl border bg-card relative overflow-hidden">
        {/* Always render children so chat can appear by default */}
        <div className="h-full grid place-items-center p-6">{children}</div>
        {/* Optional empty overlay on top when in 'empty' */}
        {state === "empty" && empty ? (
          <div className="absolute inset-0 p-6 grid place-items-center text-center pointer-events-none" aria-live="polite">
            <div className="pointer-events-auto">
              {empty}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}


