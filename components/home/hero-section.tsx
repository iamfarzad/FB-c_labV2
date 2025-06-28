"use client"

import React from "react"
import { motion, Transition } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HeroAsciiSphere } from "@/components/magicui/hero-ascii-sphere"
import { HeroSideText } from "@/components/magicui/hero-side-text-enhanced"
import { AIInput } from "@/components/ui/ai-input"
import { useReducedMotion, useIsMobile, useIsLowEndDevice } from "@/hooks/use-media-query"

interface HeroSectionProps {
  theme: "light" | "dark"
}

export const HeroSection: React.FC<HeroSectionProps> = ({ theme }) => {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const isLowEndDevice = useIsLowEndDevice()
  
  // Use proper theme-responsive variables
  const textColor = "text-foreground"
  const mutedTextColor = "text-muted-foreground"

  // Simplified animations for reduced motion or low-end devices
  const shouldReduceAnimations = prefersReducedMotion || isLowEndDevice

  const defaultTransition: Transition = { duration: 0.6, ease: "easeOut" }
  const staggeredTransition: Transition = { duration: 0.6, ease: "easeOut" }

  const handleAIInputSubmit = (value: string) => {
    const query = value.trim()
    if (query) {
      router.push(`/chat?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Only render heavy animations on desktop and high-end devices */}
      {!isMobile && !isLowEndDevice && <HeroAsciiSphere />}
      
      {/* Only show side text on desktop for performance */}
      {!isMobile && (
        <>
          <HeroSideText
            position="left"
            lines={["FROM COMPLEXITY", "TO CLARITY"]}
            className="hidden md:block"
          />
          <HeroSideText
            position="right"
            lines={["AI THAT WORKS", "FOR YOU"]}
            className="hidden md:block"
          />
        </>
      )}
      
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-none glassmorphism border-2 border-orange-accent/30 bg-orange-accent/10">
            <span className="text-sm font-tech-mono font-medium text-orange-accent tracking-tech-wide uppercase">AI That Works for Your Business</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <div className="overflow-hidden">
              <motion.h1
                initial={shouldReduceAnimations ? false : { y: 50, opacity: 0 }}
                animate={shouldReduceAnimations ? false : { y: 0, opacity: 1 }}
                transition={shouldReduceAnimations ? undefined : defaultTransition}
                className={`text-5xl sm:text-6xl lg:text-7xl font-tech font-bold leading-tight tracking-tight ${textColor} uppercase`}
              >
                I'm Farzad Bayat
              </motion.h1>
            </div>

            <div className="overflow-hidden">
              <motion.div
                initial={shouldReduceAnimations ? false : { y: 20, opacity: 0 }}
                animate={shouldReduceAnimations ? false : { y: 0, opacity: 1 }}
                transition={shouldReduceAnimations ? undefined : { ...staggeredTransition, delay: 0.2 }}
                className="relative inline-block"
              >
                <span className="relative z-10 text-4xl sm:text-5xl lg:text-6xl font-tech font-bold gradient-text">
                  AI Consultant & Builder
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-accent to-orange-accent-light opacity-20 blur-md -z-10 rounded-lg"></div>
              </motion.div>
            </div>

            <div className="overflow-hidden">
              <motion.p
                initial={shouldReduceAnimations ? false : { y: 20, opacity: 0 }}
                animate={shouldReduceAnimations ? false : { y: 0, opacity: 1 }}
                transition={shouldReduceAnimations ? undefined : { ...staggeredTransition, delay: 0.4 }}
                className={`text-xl sm:text-2xl font-tech ${mutedTextColor} max-w-3xl mx-auto leading-relaxed tracking-normal`}
              >
                <span className="relative inline-block">
                  <span className="relative z-10">No buzzwords.</span>
                  <span className="absolute bottom-1 left-0 w-full h-2 bg-orange-accent/20 -z-10"></span>
                </span>
                <span className="ml-2">Just proven results, practical tools, and clarity.</span>
              </motion.p>
            </div>

            <div className="overflow-hidden">
              <motion.p
                initial={shouldReduceAnimations ? false : { y: 20, opacity: 0 }}
                animate={shouldReduceAnimations ? false : { y: 0, opacity: 1 }}
                transition={shouldReduceAnimations ? undefined : { ...staggeredTransition, delay: 0.6 }}
                className={`text-lg sm:text-xl font-tech ${mutedTextColor} max-w-3xl mx-auto leading-relaxed tracking-normal italic`}
              >
                I've spent <span className="font-bold text-orange-accent">10,000+ hours</span> figuring out what works so your business doesn't have to.
              </motion.p>
            </div>
          </div>

          {/* AI Input */}
          <div className="max-w-xl mx-auto mt-8">
            <AIInput
              placeholder="Ask me anything about AI..."
              onSubmit={handleAIInputSubmit}
              className="mt-4"
            />
            <p className={`text-sm mt-2 text-center ${mutedTextColor} mb-4`}>
              Try asking: "How can AI help my business?" or "What's the best AI strategy?"
            </p>

            {/* Compact CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <Link href="/contact" className="text-sm">
                <button className="group relative overflow-hidden px-4 py-2 rounded-full border border-orange-accent text-orange-accent hover:bg-orange-accent hover:text-white transition-all duration-200 text-sm font-medium">
                  Book a Call
                </button>
              </Link>

              <span className="text-orange-accent/50 text-sm">or</span>

              <Link href="/chat" className="text-sm">
                <button className="px-4 py-2 rounded-full bg-transparent text-orange-accent hover:bg-orange-accent/10 transition-all duration-200 text-sm font-medium border border-transparent hover:border-orange-accent/20">
                  Try AI Assistant
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
