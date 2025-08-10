"use client"

import { useEffect, useRef, useState } from "react"

interface StatCounterProps {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
}

export function StatCounter({ to, duration = 900, prefix = "", suffix = "" }: StatCounterProps) {
  const [val, setVal] = useState(0)
  const start = useRef<number>()

  useEffect(() => {
    let raf = 0
    const step = (t: number) => {
      if (!start.current) start.current = t
      const p = Math.min((t - start.current) / duration, 1)
      setVal(Math.round(p * to))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])

  return <span>{prefix}{val.toLocaleString()}{suffix}</span>
}


