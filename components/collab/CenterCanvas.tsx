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
      <div className="h-full rounded-xl border bg-card">
        {state === "empty" ? (
          <div className="grid h-full place-items-center p-6 text-center" aria-live="polite">
            {empty}
          </div>
        ) : (
          <div className="h-full grid place-items-center p-6">{children}</div>
        )}
      </div>
    </div>
  )
}


