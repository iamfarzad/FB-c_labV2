"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-media-query"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  autoPlay?: boolean
  interval?: number
}

export function Carousel({
  children,
  className,
  autoPlay = true,
  interval = 3000,
  ...props
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const prefersReducedMotion = useReducedMotion()
  const childrenArray = React.Children.toArray(children)
  const itemsToShow = 5 // Number of items to show at once

  // Duplicate items for infinite loop effect
  const items = [...childrenArray, ...childrenArray, ...childrenArray]

  // Respect reduced motion preferences
  const shouldAutoPlay = autoPlay && !prefersReducedMotion

  React.useEffect(() => {
    if (!shouldAutoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (childrenArray.length * 3))
    }, interval)

    return () => clearInterval(timer)
  }, [shouldAutoPlay, interval, childrenArray.length])

  // Calculate the current offset for the infinite loop effect
  const offset = -((currentIndex % childrenArray.length) * (100 / itemsToShow))

  // Adjust transition duration based on motion preferences
  const transitionDuration = prefersReducedMotion ? 0 : 1000

  return (
    <div className={cn("relative w-full overflow-hidden", className)} {...props}>
      <div
        className="flex w-full ease-in-out"
        style={{ 
          transform: `translateX(${offset}%)`,
          transition: `transform ${transitionDuration}ms ease-in-out`
        }}
      >
        {items.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 px-2"
            style={{ width: `${100 / itemsToShow}%` }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
