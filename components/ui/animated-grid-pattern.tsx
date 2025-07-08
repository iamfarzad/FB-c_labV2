"use client"

import { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedGridPatternProps {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: any
  numSquares?: number
  className?: string
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}: AnimatedGridPatternProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [squares, setSquares] = useState<Array<{ id: number; pos: [number, number] }>>([])
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we only render on client to avoid hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  function getPos(): [number, number] {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ]
  }

  // Generate squares function
  function generateSquares(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(),
    }))
  }

  // Update squares when dimensions change
  useEffect(() => {
    if (dimensions.width && dimensions.height && isMounted) {
      setSquares(generateSquares(numSquares))
    }
  }, [dimensions, numSquares, isMounted])

  // Resize observer to update container dimensions
  useEffect(() => {
    if (!isMounted) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [isMounted])

  // Return static pattern during SSR and before mount
  if (!isMounted) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full",
          className,
        )}
        {...props}
      >
        <svg
          aria-hidden="true"
          className="h-full w-full fill-gray-400/30 stroke-gray-400/30"
        >
          <defs>
            <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
              <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className,
      )}
      {...props}
    >
      <svg
        aria-hidden="true"
        className="h-full w-full fill-gray-400/30 stroke-gray-400/30"
      >
        <defs>
          <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
            <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(({ pos: [x, y], id }, index) => (
            <rect
              key={`${x}-${y}-${index}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
              fill="currentColor"
              strokeWidth="0"
              className="animate-pulse"
              style={{
                opacity: maxOpacity,
                animationDelay: `${index * 0.1}s`,
                animationDuration: `${duration}s`,
              }}
            />
          ))}
        </svg>
      </svg>
    </div>
  )
}
