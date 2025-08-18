"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { FbcIcon } from "@/components/ui/fbc-icon"

interface TopHeaderProps {
  title: string
  subtitle?: string
  rightActions?: React.ReactNode
  className?: string
}

export function TopHeader({ title, subtitle, rightActions, className }: TopHeaderProps) {
  return (
    <header
      className={cn(
        "border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        className
      )}
      role="region"
      aria-label="Collaboration header"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <FbcIcon className="h-5 w-5" />
          <div>
            <h1 className="text-sm font-semibold leading-tight tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {rightActions}
        </div>
      </div>
    </header>
  )}


