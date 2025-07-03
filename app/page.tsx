"use client"
import { HeroSection } from "@/components/home/hero-section"
import { AboutMeCard } from "@/components/home/about-me-card"
import { WhatIOffer } from "@/components/home/what-i-offer"
import { WhyWorkWithMe } from "@/components/home/why-work-with-me"
import { Results } from "@/components/home/results"
import { SocialProof } from "@/components/home/social-proof"
import { FreeWorkshop } from "@/components/home/free-workshop"
import { FinalCTA } from "@/components/home/final-cta"
import { TechMarquee } from "@/components/home/tech-marquee"
import { useTheme } from "next-themes"

export default function HomePage() {
  const { theme } = useTheme()
  const currentTheme = (theme as "light" | "dark") || "dark"

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection theme={currentTheme} />

      {/* Tech Marquee */}
      <TechMarquee />

      {/* About Me Card */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AboutMeCard theme={currentTheme} />
        </div>
      </section>

      {/* What I Offer */}
      <WhatIOffer theme={currentTheme} />

      {/* Why Work With Me */}
      <WhyWorkWithMe theme={currentTheme} />

      {/* Results */}
      <Results theme={currentTheme} />

      {/* Social Proof */}
      <SocialProof theme={currentTheme} />

      {/* Free Workshop */}
      <FreeWorkshop theme={currentTheme} />

      {/* Final CTA */}
      <FinalCTA theme={currentTheme} />
    </div>
  )
}
