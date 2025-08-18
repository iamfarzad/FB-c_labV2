"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface ConsentOverlayProps {
  open: boolean
  email: string
  company: string
  onEmailChange: (v: string) => void
  onCompanyChange: (v: string) => void
  onAllow: () => void
  onDeny: () => void
  className?: string
}

export function ConsentOverlay({ open, email, company, onEmailChange, onCompanyChange, onAllow, onDeny, className }: ConsentOverlayProps) {
  if (!open) return null
  return (
    <div className={cn("fixed inset-0 z-[60] grid place-items-center bg-background/80 backdrop-blur p-4", className)}>
      <div className="w-full max-w-lg rounded-xl border bg-card p-4 shadow">
        <h2 className="text-base font-semibold">Personalize this chat using your public company info?</h2>
        <p className="mt-1 text-sm text-muted-foreground">We’ll fetch from your company site and LinkedIn to ground results with citations. See our <a href="/privacy" className="underline">Privacy & Terms</a>.</p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <input
            type="email"
            placeholder="Work email (name@company.com)"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Work email"
          />
          <input
            type="text"
            placeholder="Company website (optional)"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Company website"
          />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <button onClick={onDeny} className="btn-minimal">No thanks</button>
          <button onClick={onAllow} className="btn-primary px-3 py-2 rounded-md">Allow</button>
        </div>
      </div>
    </div>
  )
}


