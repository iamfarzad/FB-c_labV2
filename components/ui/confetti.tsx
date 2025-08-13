"use client"

import { useEffect, useRef } from 'react'

type ConfettiProps = { isActive: boolean; onComplete?: () => void }

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => { onComplete?.() }, 1500)
    return () => clearTimeout(t)
  }, [isActive, onComplete])
  if (!isActive) return null
  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-0 animate-pulse opacity-70" style={{ background:
        'radial-gradient(circle at 20% 20%, rgba(59,130,246,.2), transparent 40%),'+
        'radial-gradient(circle at 80% 30%, rgba(16,185,129,.2), transparent 40%),'+
        'radial-gradient(circle at 30% 80%, rgba(236,72,153,.2), transparent 40%)'
      }} />
    </div>
  )
}


