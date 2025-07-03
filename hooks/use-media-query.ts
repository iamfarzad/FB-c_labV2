"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [matches, query])

  return matches
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)")
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)")
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

export function useIsLowEndDevice() {
  const [isLowEnd, setIsLowEnd] = useState(false)

  useEffect(() => {
    // Check for low-end device indicators
    const connection =
      (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    const hardwareConcurrency = navigator.hardwareConcurrency || 1
    const deviceMemory = (navigator as any).deviceMemory || 1

    const isLowEndDevice =
      hardwareConcurrency <= 2 ||
      deviceMemory <= 2 ||
      (connection && connection.effectiveType && ["slow-2g", "2g"].includes(connection.effectiveType))

    setIsLowEnd(isLowEndDevice)
  }, [])

  return isLowEnd
}
