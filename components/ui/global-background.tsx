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
      {/* Animated gradient orbs driven by design tokens */}
      <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.25),transparent_60%)] blur-3xl animate-drift-slow" />
      <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.15),transparent_60%)] blur-3xl animate-drift-medium" />
      <div className="absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--muted-foreground)/0.15),transparent_60%)] blur-3xl animate-drift-slower" />

      {/* Faint animated grid for depth */}
      <AnimatedGridPattern
        numSquares={12}
        maxOpacity={0.04}
        duration={8}
        repeatDelay={4}
        className="text-accent/10"
      />

      {/* Soft vignette to improve contrast with content */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/40 to-background" />
    </div>
  )
}