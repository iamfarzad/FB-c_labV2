"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { AboutHero as HeroSection } from "@/components/about/hero-section"
import { StorySection } from "@/components/about/story-section"
import { WhySection } from "@/components/about/why-section"
import { SkillsSection } from "@/components/about/skills-section"
import { ProjectsSection } from "@/components/about/projects-section"
import { TestimonialsSection } from "@/components/about/testimonials-section"
import { CTASection as CtaSection } from "@/components/about/cta-section"

export default function AboutPage() {
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
        className="min-h-screen"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          paddingTop: '80px' // Adjust based on header height
        }}
      >
        {/* Hero Section */}
        <HeroSection theme={theme} />

        {/* Story Section */}
        <StorySection theme={theme} />

        {/* Why I Do This Work Section */}
        <WhySection theme={theme} />

        {/* Skills Section */}
        <SkillsSection theme={theme} />

        {/* Projects Section */}
        <ProjectsSection theme={theme} />

        {/* Testimonials Section */}
        <TestimonialsSection theme={theme} />

        {/* CTA Section */}
        <CtaSection theme={theme} />
      </div>
    </Layout>
  )
}
