"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Rajdhani, Space_Mono, Montserrat } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AccessibilityProvider } from "@/components/accessibility/accessibility-provider"
import { CookieConsent } from "@/components/legal/cookie-consent"
import { initPerformanceOptimizations } from "@/lib/performance"
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
  
  useEffect(() => {
    // Mark as mounted for client-side rendering
    setIsMounted(true)
    
    // Initialize performance optimizations
    const cleanup = initPerformanceOptimizations()
    
    // Cleanup function
    return () => {
      cleanup?.()
    }
  }, [])
  
  // Skip loading screen to prevent blocking content
  // if (!isMounted) {
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-background">
  //       <div className="animate-pulse text-2xl font-bold">Loading...</div>
  //     </div>
  //   )
  // }

  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${rajdhani.variable} ${spaceMono.variable} ${montserrat.variable} font-sans relative min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            <div className="min-h-screen bg-background">
              {children}
              <CookieConsent />
              
              {/* Global Styles */}
              <style jsx global>{
                `
                  :root {
                    --color-orange-accent: #FF5B04;
                    --color-gunmetal: #233038;
                    --color-light-silver: #D3DBDD;
                    --color-gunmetal-light-alpha: rgba(35, 48, 56, 0.85);
                    --color-light-silver-dark-alpha: rgba(211, 219, 221, 0.95);
                    --color-gunmetal-lighter: #3A4C5A;
                    --color-light-silver-darker: #BBC4C7;
                    --color-orange-accent-hover: #E65200;
                    --color-orange-accent-light: #FF8F6A;
                    --color-text-on-orange: #FFFFFF;
                    --shadow-soft: 0 8px 32px rgba(0, 0, 0, 0.1);
                    --shadow-medium: 0 12px 40px rgba(0, 0, 0, 0.15);
                    --shadow-strong: 0 20px 60px rgba(0, 0, 0, 0.2);
                    --gradient-orange: linear-gradient(135deg, #FF5B04 0%, #FF8F6A 100%);
                    --gradient-glass: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
                  }
                  
                  .dark {
                    --bg-primary: var(--color-gunmetal);
                    --bg-secondary: var(--color-gunmetal-lighter);
                    --text-primary: var(--color-light-silver);
                    --glass-bg: rgba(35, 48, 56, 0.7);
                    --glass-border: rgba(255, 255, 255, 0.25);
                    --chat-bubble-ai: var(--color-gunmetal-lighter);
                    --chat-bubble-system: var(--color-orange-accent-light);
                    --chat-bubble-system-text: var(--color-gunmetal);
                    --surface-glow: rgba(255, 91, 4, 0.1);
                  }
                  
                  .light {
                    --bg-primary: var(--color-light-silver);
                    --bg-secondary: #FFFFFF;
                    --text-primary: var(--color-gunmetal);
                    --glass-bg: rgba(211, 219, 221, 0.7);
                    --glass-border: rgba(0, 0, 0, 0.15);
                    --chat-bubble-ai: #FFFFFF;
                    --chat-bubble-system: var(--color-orange-accent-light);
                    --chat-bubble-system-text: var(--color-gunmetal);
                    --surface-glow: rgba(255, 91, 4, 0.05);
                  }
                  
                  .glassmorphism {
                    background: var(--glass-bg);
                    backdrop-filter: blur(24px) saturate(200%);
                    -webkit-backdrop-filter: blur(24px) saturate(200%);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--shadow-soft), 0 0 40px rgba(255, 255, 255, 0.1);
                    position: relative;
                  }
                  
                  .glassmorphism::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
                    border-radius: inherit;
                    pointer-events: none;
                    z-index: -1;
                  }
                  
                  .glass-button {
                    background: var(--gradient-orange);
                    border: none;
                    box-shadow: var(--shadow-medium);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                  }
                  
                  .glass-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                  }
                  
                  .glass-button:hover::before {
                    left: 100%;
                  }
                  
                  .glass-button:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-strong);
                  }
                  
                  .glass-button:active {
                    transform: translateY(0);
                  }
                  
                  .chat-bubble {
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--shadow-soft);
                    transition: all 0.3s ease;
                  }
                  
                  .chat-bubble:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-medium);
                  }
                  
                  .floating-element {
                    animation: float 6s ease-in-out infinite;
                  }
                  
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                  }
                  
                  .pulse-glow {
                    animation: pulseGlow 2s ease-in-out infinite alternate;
                  }
                  
                  @keyframes pulseGlow {
                    from { box-shadow: 0 0 20px var(--surface-glow); }
                    to { box-shadow: 0 0 40px var(--surface-glow), 0 0 60px var(--surface-glow); }
                  }
                  
                  .slide-in {
                    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                  }
                  
                  @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                  }
                  
                  .fade-in {
                    animation: fadeIn 0.3s ease-out;
                  }
                  
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                  
                  .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  
                  .gradient-text {
                    background: var(--gradient-orange);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                  }
                  
                  .surface-glow {
                    box-shadow: 0 0 30px var(--surface-glow);
                  }

                  @keyframes fade-in-up {
                    from {
                      opacity: 0;
                      transform: translateY(30px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }

                  @keyframes float-slow {
                    0%, 100% {
                      transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                      transform: translateY(-20px) rotate(180deg);
                    }
                  }

                  @keyframes shimmer {
                    0% {
                      transform: translateX(-100%) skewX(-12deg);
                    }
                    100% {
                      transform: translateX(200%) skewX(-12deg);
                    }
                  }

                  .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out;
                  }

                  .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                  }

                  .animate-shimmer {
                    animation: shimmer 1.5s ease-out;
                  }
                  
                  /* Smooth scrolling */
                  html {
                    scroll-behavior: smooth;
                  }
                  
                  /* Focus styles for keyboard navigation */
                  :focus-visible {
                    outline: 2px solid var(--color-orange-accent);
                    outline-offset: 2px;
                  }
                  
                  /* Reduced motion preferences */
                  @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                      animation-duration: 0.01ms !important;
                      animation-iteration-count: 1 !important;
                      transition-duration: 0.01ms !important;
                      scroll-behavior: auto !important;
                    }
                  }
                `
              }</style>
            </div>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
