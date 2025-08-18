"use client"

import type React from "react"

export function WebcamPanel({ onBack }: { onBack?: () => void }) {
  return (
    <div className="h-full w-full p-3">
      <div className="rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Webcam (design placeholder)</h3>
          {onBack ? (
            <button className="btn-minimal" onClick={onBack} aria-label="Back to chat">Back</button>
          ) : null}
        </div>
        <div className="grid place-items-center h-56 text-sm text-muted-foreground">
          Camera preview placeholder
        </div>
      </div>
    </div>
  )
}


