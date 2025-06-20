"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

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
  const childrenArray = React.Children.toArray(children)
  const itemsToShow = 5 // Number of items to show at once

  // Duplicate items for infinite loop effect
  const items = [...childrenArray, ...childrenArray, ...childrenArray]

  React.useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (childrenArray.length * 3))
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, childrenArray.length])

  // Calculate the current offset for the infinite loop effect
  const offset = -((currentIndex % childrenArray.length) * (100 / itemsToShow))

  return (
    <div className={cn("relative w-full overflow-hidden", className)} {...props}>
      <div
        className="flex w-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(${offset}%)` }}
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
