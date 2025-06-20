"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { HeroSection } from "@/components/home/hero-section"
import { AboutMeCard } from "@/components/home/about-me-card"
import { WhyWorkWithMe } from "@/components/home/why-work-with-me"
import { ProofSection } from "@/components/home/proof-section"
import { AISolutionsSection } from "@/components/home/ai-solutions-redesigned"
import { Results } from "@/components/home/results"
import { TechMarquee } from "@/components/home/tech-marquee"
import { FinalCTA } from "@/components/home/final-cta"

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <Layout theme={theme} onThemeToggle={toggleTheme}>
      <div
        className="relative"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* Hero Section */}
        <HeroSection theme={theme} />

        {/* About Me Card */}
        <AboutMeCard theme={theme} />

        {/* Why Work With Me */}
        <WhyWorkWithMe theme={theme} />

        {/* AI Solutions Section - Merged WhatIOffer and AIBuildSection */}
        <AISolutionsSection theme={theme} />

        {/* Proof Section */}
        <ProofSection theme={theme} />

        {/* Results */}
        <Results theme={theme} />

        {/* AI Logos Marquee */}
        <TechMarquee />

        {/* Final CTA */}
        <FinalCTA theme={theme} />
      </div>
    </Layout>
  )
}
