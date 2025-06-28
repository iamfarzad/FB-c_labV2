"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Rajdhani, Space_Mono, Montserrat } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider"
import { CookieConsent } from "@/components/legal/cookie-consent"
import { initPerformanceOptimizations } from "@/lib/performance"
import { DataContext } from "@/context/data-context"
import { ToastProvider } from "@/components/ui/use-toast"
import type { Example } from "@/lib/types"
import "./globals.css"

// Initialize fonts with preload and display swap for better performance
const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap"
})

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap"
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap"
})

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
}

export default function ClientLayout({ children }: ClientLayoutProps) {
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
      className={`${rajdhani.variable} ${spaceMono.variable} ${montserrat.variable}`}
      style={{
        '--font-rajdhani': rajdhani.style.fontFamily,
        '--font-space-mono': spaceMono.style.fontFamily,
        '--font-montserrat': montserrat.style.fontFamily,
      } as React.CSSProperties}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
