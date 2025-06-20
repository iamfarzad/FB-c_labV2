"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  autoFill?: boolean
}

export function Marquee({
  children,
  className,
  autoFill = false,
  ...props
}: MarqueeProps) {
  return (
    <div
      className={cn("group relative flex w-full overflow-hidden [--duration:40s]", className)}
      {...props}
    >
      <div className="flex min-w-full shrink-0 justify-around gap-4 [animation:marquee-var_linear_infinite] group-hover:[animation-play-state:paused]">
        {children}
        {autoFill && React.Children.map(children, (child) => child)}
      </div>
      <div className="flex min-w-full shrink-0 justify-around gap-4 [animation:marquee-var_linear_infinite] [animation-delay:calc(var(--duration)/-2)] group-hover:[animation-play-state:paused]">
        {children}
        {autoFill && React.Children.map(children, (child) => child)}
      </div>
    </div>
  )
}
