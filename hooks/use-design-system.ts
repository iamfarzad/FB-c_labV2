"use client"

import { useState, useEffect, useMemo } from "react"

type Theme = "light" | "dark" | "system"
type Mode = "light" | "dark"

interface DesignTokens {
  // Colors
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  card: string
  cardForeground: string
  border: string
  input: string
  ring: string
  destructive: string
  destructiveForeground: string

  // Spacing
  spacing: (factor: number) => string

  // Typography
  fontFamilySans: string
  fontFamilyMono: string
  fontSize: (scale: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl") => string

  // Radii
  radius: string
}

const lightTokens: Omit<DesignTokens, "spacing" | "fontSize"> = {
  background: "hsl(0 0% 100%)",
  foreground: "hsl(222.2 84.2% 4.9%)",
  primary: "hsl(222.2 47.4% 11.2%)",
  primaryForeground: "hsl(210 40% 98%)",
  secondary: "hsl(210 40% 96.1%)",
  secondaryForeground: "hsl(222.2 47.4% 11.2%)",
  accent: "hsl(210 40% 96.1%)",
  accentForeground: "hsl(222.2 47.4% 11.2%)",
  card: "hsl(0 0% 100%)",
  cardForeground: "hsl(222.2 84.2% 4.9%)",
  border: "hsl(214.3 31.8% 91.4%)",
  input: "hsl(214.3 31.8% 91.4%)",
  ring: "hsl(222.2 84.2% 4.9%)",
  destructive: "hsl(0 84.2% 60.2%)",
  destructiveForeground: "hsl(210 40% 98%)",
  radius: "0.5rem",
  fontFamilySans: "var(--font-sans)",
  fontFamilyMono: "var(--font-mono)",
}

const darkTokens: Omit<DesignTokens, "spacing" | "fontSize"> = {
  background: "hsl(222.2 84.2% 4.9%)",
  foreground: "hsl(210 40% 98%)",
  primary: "hsl(210 40% 98%)",
  primaryForeground: "hsl(222.2 47.4% 11.2%)",
  secondary: "hsl(217.2 32.6% 17.5%)",
  secondaryForeground: "hsl(210 40% 98%)",
  accent: "hsl(217.2 32.6% 17.5%)",
  accentForeground: "hsl(210 40% 98%)",
  card: "hsl(222.2 84.2% 4.9%)",
  cardForeground: "hsl(210 40% 98%)",
  border: "hsl(217.2 32.6% 17.5%)",
  input: "hsl(217.2 32.6% 17.5%)",
  ring: "hsl(217.2 91.2% 59.8%)",
  destructive: "hsl(0 62.8% 30.6%)",
  destructiveForeground: "hsl(210 40% 98%)",
  radius: "0.5rem",
  fontFamilySans: "var(--font-sans)",
  fontFamilyMono: "var(--font-mono)",
}

const baseSpacing = 4 // in pixels

const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
}

export function useDesignSystem() {
  const [theme, setTheme] = useState<Theme>("system")
  const [effectiveMode, setEffectiveMode] = useState<Mode>("light")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    let currentMode: Mode
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
      currentMode = systemTheme
    } else {
      root.classList.add(theme)
      currentMode = theme
    }
    setEffectiveMode(currentMode)
    localStorage.setItem("theme", theme)
  }, [theme])

  const tokens = useMemo<DesignTokens>(() => {
    const baseTokens = effectiveMode === "dark" ? darkTokens : lightTokens
    return {
      ...baseTokens,
      spacing: (factor: number) => `${baseSpacing * factor}px`,
      fontSize: (scale: keyof typeof fontSizes) => fontSizes[scale],
    }
  }, [effectiveMode])

  return {
    theme,
    setTheme,
    mode: effectiveMode,
    tokens,
  }
}
