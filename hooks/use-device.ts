"use client"

import { useState, useEffect } from "react"

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Define callback for media query changes
    const listener = () => setMatches(media.matches)

    // Add listener
    media.addEventListener("change", listener)

    // Clean up
    return () => media.removeEventListener("change", listener)
  }, [query])

  // Return false during SSR to prevent hydration mismatch
  return isMounted ? matches : false
}

export const useDevice = () => {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return { isMobile, isTablet, isDesktop }
}
