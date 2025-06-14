"use client"

import React from "react"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { TextParticle } from "@/components/ui/text-particle"

interface ServicesHeroProps {
  theme: "light" | "dark"
}

export const ServicesHero: React.FC<ServicesHeroProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background TextParticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30">
        <TextParticle
          text="F.B/c"
          fontSize={600}
          particleColor="#F97316"
          particleSize={2}
          particleDensity={3}
          backgroundColor="transparent"
          className="w-full h-full"
        />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Services</span>
          </div>
          
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${textColor} mb-6`}>
            Practical AI Services That <span className="gradient-text">Deliver Results</span>
          </h1>
          
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto mb-8`}>
            Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/contact" 
              className="group relative overflow-hidden px-8 py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center space-x-3">
                <span>Book a Free Consultation</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
