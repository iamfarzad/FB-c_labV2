"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Layout } from "@/components/layout"
import { HeroSection } from "@/components/home/hero-section"
import { AboutMeCard } from "@/components/home/about-me-card"
import { WhyWorkWithMe } from "@/components/home/why-work-with-me"
import { AISolutionsSection } from "@/components/home/ai-solutions-redesigned"
import { ProofSection } from "@/components/home/proof-section"
import { Results } from "@/components/home/results"
import { TechMarquee } from "@/components/home/tech-marquee"
import { FinalCTA } from "@/components/home/final-cta"
import ErrorBoundary from "@/components/ErrorBoundary"
import { SkeletonHero } from "@/components/ui/skeleton"
import { initPerformanceOptimizations } from "@/lib/performance"
import { useIsLowEndDevice, useReducedMotion } from "@/hooks/use-media-query"

export default function HomePage() {
  const { resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [sectionsLoaded, setSectionsLoaded] = useState({
    hero: false,
    about: false,
    why: false,
    solutions: false,
    proof: false,
    results: false,
    marquee: false,
    cta: false,
  })

  const isLowEndDevice = useIsLowEndDevice()
  const prefersReducedMotion = useReducedMotion()

  // Initialize performance optimizations
  useEffect(() => {
    const cleanup = initPerformanceOptimizations()
    
    // Start loading immediately for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
      setSectionsLoaded(prev => ({ ...prev, hero: true }))
    }, 50) // Reduced from 100ms

    return () => {
      cleanup?.()
      clearTimeout(timer)
    }
  }, [])

  // Progressive section loading
  useEffect(() => {
    if (isLoading) return

    const loadSection = (sectionKey: keyof typeof sectionsLoaded, delay: number) => {
      setTimeout(() => {
        setSectionsLoaded(prev => ({ ...prev, [sectionKey]: true }))
      }, delay)
    }

    // Much faster loading for better UX
    const baseDelay = isLowEndDevice ? 100 : 50
    loadSection('about', baseDelay)
    loadSection('why', baseDelay * 2)
    loadSection('solutions', baseDelay * 3)
    loadSection('proof', baseDelay * 4)
    loadSection('results', baseDelay * 5)
    loadSection('marquee', baseDelay * 6)
    loadSection('cta', baseDelay * 7)
  }, [isLoading, isLowEndDevice])

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to analytics in production
        if (process.env.NODE_ENV === 'production') {
          console.error('HomePage Error:', error, errorInfo)
          // Send to error tracking service
        }
      }}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      <Layout>
        <div className="relative">
          {/* Hero Section */}
          <ErrorBoundary fallback={<SkeletonHero />}>
            {sectionsLoaded.hero ? (
              <HeroSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
            ) : (
              <SkeletonHero />
            )}
          </ErrorBoundary>

          {/* About Me Card */}
          <ErrorBoundary>
            {sectionsLoaded.about ? (
              <AboutMeCard />
            ) : (
              <div className="h-[600px] flex items-center justify-center">
                <div className="animate-pulse text-center">
                  <div className="h-8 w-48 bg-muted rounded mx-auto mb-4" />
                  <div className="h-4 w-96 bg-muted rounded mx-auto" />
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* Why Work With Me */}
          <ErrorBoundary>
            {sectionsLoaded.why ? (
              <WhyWorkWithMe theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
            ) : (
              <div className="h-[500px] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto p-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 w-16 bg-muted rounded-lg mb-4" />
                      <div className="h-6 w-24 bg-muted rounded mb-2" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* AI Solutions Section */}
          <ErrorBoundary>
            {sectionsLoaded.solutions ? (
              <AISolutionsSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
            ) : (
              <div className="h-[700px] flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto p-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-40 bg-muted rounded-lg mb-4" />
                      <div className="space-y-2">
                        <div className="h-6 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-5/6 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* Proof Section */}
          <ErrorBoundary>
            {sectionsLoaded.proof ? (
              <ProofSection theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
            ) : (
              <div className="h-[600px] flex items-center justify-center bg-muted/10">
                <div className="animate-pulse text-center">
                  <div className="h-8 w-64 bg-muted rounded mx-auto mb-8" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* Results */}
          <ErrorBoundary>
            {sectionsLoaded.results ? (
              <Results theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-pulse text-center max-w-4xl mx-auto p-8">
                  <div className="h-8 w-48 bg-muted rounded mx-auto mb-8" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded transform -skew-y-1" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* AI Logos Marquee */}
          <ErrorBoundary>
            {sectionsLoaded.marquee ? (
              <TechMarquee />
            ) : (
              <div className="h-[200px] flex items-center justify-center bg-[var(--color-gunmetal)]">
                <div className="animate-pulse">
                  <div className="h-8 w-64 bg-muted rounded mx-auto mb-8" />
                  <div className="flex gap-8 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-12 w-24 bg-muted rounded" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ErrorBoundary>

          {/* Final CTA */}
          <ErrorBoundary>
            {sectionsLoaded.cta ? (
              <FinalCTA theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse text-center">
                  <div className="h-16 w-96 bg-muted rounded mx-auto mb-6" />
                  <div className="h-4 w-64 bg-muted rounded mx-auto mb-8" />
                  <div className="h-12 w-48 bg-muted rounded mx-auto" />
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </Layout>
    </ErrorBoundary>
  )
}
