"use client"

import type React from "react"
import { cn } from "@/lib/utils"

export function HelpHint({ className }: { className?: string }) {
  return (
    <p className={cn("text-[11px] text-muted-foreground px-1", className)}>
      Press Enter to send • Shift+Enter for newline
    </p>
  )
}



