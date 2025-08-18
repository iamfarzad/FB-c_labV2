"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface VoiceOverlayProps {
  open: boolean
  onClose: () => void
  className?: string
}

export function VoiceOverlay({ open, onClose, className }: VoiceOverlayProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)

    // Focus the primary action first for SR/keyboard users
    const toFocus = primaryBtnRef.current || closeBtnRef.current
    toFocus?.focus()

    // Simple focus trap within the dialog
    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const container = dialogRef.current
      if (!container) return
      const tabbables = Array.from(container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(el => !el.hasAttribute('disabled'))
      if (tabbables.length === 0) return
      const first = tabbables[0]
      const last = tabbables[tabbables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    containerAdd(dialogRef.current, 'keydown', handleTrap)

    return () => {
      window.removeEventListener('keydown', handleKey)
      containerRemove(dialogRef.current, 'keydown', handleTrap)
    }
  }, [open, onClose])

  function containerAdd(node: HTMLDivElement | null, type: string, handler: (e: any) => void) {
    if (node) node.addEventListener(type, handler)
  }
  function containerRemove(node: HTMLDivElement | null, type: string, handler: (e: any) => void) {
    if (node) node.removeEventListener(type, handler)
  }

  if (!open) return null

  return (
    <div className={cn("fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4", className)}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Voice input overlay"
        className="modal-content max-w-md w-full p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Voice Input (Design Only)</h2>
          <button ref={closeBtnRef} type="button" className="btn-minimal" onClick={onClose}>Close</button>
        </div>
        <div className="rounded-xl border border-border/30 bg-card/80 p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-orange-accent)]/15 border border-[var(--color-orange-accent)]/30 flex items-center justify-center mb-3 animate-pulse-slow">
            <div className="w-10 h-10 rounded-full bg-[var(--color-orange-accent)]/30" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">Listening… Speak to compose a message.</p>
          <p className="text-xs text-muted-foreground mt-1">Press Esc to close</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn-secondary px-4 py-2" onClick={onClose}>Cancel</button>
            <button ref={primaryBtnRef} type="button" className="btn-primary px-4 py-2" onClick={onClose}>Insert Transcript</button>
          </div>
        </div>
      </div>
    </div>
  )
}


