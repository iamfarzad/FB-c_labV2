"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider"
import { CookieConsent } from "@/components/legal/cookie-consent"
import { initPerformanceOptimizations } from "@/lib/performance"
import { DataContext } from "@/context/data-context"
import { ToastProvider } from "@/components/ui/use-toast"
import type { Example } from "@/lib/types"
import "./globals.css"

// Structured data for SEO
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "F.B/c AI Consulting",
  "url": "https://fb-consulting.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://fb-consulting.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "F.B/c",
    "logo": {
      "@type": "ImageObject",
      "url": "https://fb-consulting.com/logo.png"
    }
  }
}

interface ClientLayoutProps {
  children: ReactNode
  className?: string
}

export default function ClientLayout({ children, className }: ClientLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [examples, setExamples] = useState<Example[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mark as mounted for client-side rendering
    setIsMounted(true)
    
    // Initialize performance optimizations
    const cleanup = initPerformanceOptimizations()
    
    // Load examples data
    setIsLoading(true)
    fetch("/data/examples.json")
      .then((res) => res.json())
      .then((fetchedData: Example[]) => {
        setExamples(fetchedData)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load examples:", error)
        setIsLoading(false)
      })
    
    // Cleanup function
    return () => {
      cleanup?.()
    }
  }, [])

  const empty: Example = {
    title: "",
    url: "",
    spec: "",
    code: "",
    description: "",
    category: "general",
  }

  const dataContextValue = {
    examples,
    isLoading,
    setExamples,
    defaultExample: examples.length > 0 ? examples[0] : empty,
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={className}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <DataContext.Provider value={dataContextValue}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AccessibilityProvider>
              <ToastProvider>
                <div className="min-h-screen bg-background">
                  {children}
                  <CookieConsent />
                </div>
              </ToastProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </DataContext.Provider>
      </body>
    </html>
  )
}

// Global styles component removed - styles are now in globals.css
