"use client"

import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"

interface GlobalBackgroundProps {
  className?: string
}

export function GlobalBackground({ className }: GlobalBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <AnimatedGridPattern
        width={32}
        height={32}
        numSquares={48}
        maxOpacity={0.12}
        duration={5}
        className="text-accent/25"
      />
    </div>
  )
}