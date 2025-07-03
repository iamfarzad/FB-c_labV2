"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

interface ClientLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function ClientLayout({ children, className }: ClientLayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-background">
          <div className="animate-pulse">
            <div className="h-16 bg-muted"></div>
            <div className="container mx-auto px-4 py-8">
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </body>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      value={{
        light: "light",
        dark: "dark",
      }}
    >
      <div className={cn("min-h-screen bg-background font-sans antialiased", className)}>
        <Header theme={theme} onThemeToggle={toggleTheme} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
