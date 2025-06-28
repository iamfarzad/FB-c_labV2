"use client"

import React, { useMemo } from "react"
import dynamic from 'next/dynamic';
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { TextParticle } from "@/components/ui/text-particle"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/ErrorBoundary";

// Dynamically import CanvasRevealEffect with no SSR
const CanvasRevealEffectBase = dynamic(() => import('@/components/ui/canvas-reveal-effect'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent" />
  )
});

// Wrapper component with error boundary
const CanvasRevealEffect = (props: {
  animationSpeed?: number;
  colors: number[][];
  dotSize?: number;
  showGradient?: boolean;
  reverse?: boolean;
  opacities?: number[];
  containerClassName?: string;
}) => (
  <ErrorBoundary fallback={null}>
    <CanvasRevealEffectBase {...props} />
  </ErrorBoundary>
);

interface ServicesHeroProps {
  theme: "light" | "dark"
}

export const ServicesHero: React.FC<ServicesHeroProps> = ({ theme }) => {

  // Colors for the canvas effect based on theme
  const canvasColors = useMemo(() => {
    return theme === 'dark'
      ? [[255, 91, 4], [255, 159, 28]] // Orange accent colors for dark theme
      : [[255, 91, 4, 0.5], [255, 159, 28, 0.5]] // Lighter, more transparent for light theme
  }, [theme]);

  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Canvas Reveal Effect Background */}
      <div className="absolute inset-0 -z-20">
        <CanvasRevealEffect
          animationSpeed={3}
          colors={canvasColors}
          dotSize={3}
          showGradient={false}
          reverse={false}
          opacities={[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
          containerClassName="opacity-30 dark:opacity-20"
        />
      </div>

      {/* Background TextParticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-20">
        <TextParticle
          text="F.B/c"
          fontSize={600}
          particleColor={theme === 'dark' ? 'var(--color-orange-accent)' : 'var(--color-orange-accent-light)'}
          particleSize={2}
          particleDensity={3}
          backgroundColor="transparent"
          className="w-full h-full"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg bg-white dark:bg-[var(--glass-bg)] border-gray-200 dark:border-[var(--glass-border)] border mb-6`}>
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-medium text-[var(--color-orange-accent)] uppercase tracking-wider">
              Services
            </span>
          </div>

          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[var(--color-gunmetal)] dark:text-[var(--color-light-silver)] mb-6`}>
            Practical AI Services That{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]">
              Deliver Results
            </span>
          </h1>

          <p className={`text-lg md:text-xl text-[var(--color-gunmetal)]/90 dark:text-[var(--color-light-silver)]/90 max-w-3xl mx-auto mb-8`}>
            Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="default"
              className="shadow-lg"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="relative flex items-center space-x-3">
                <span>Book a Free Consultation</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
