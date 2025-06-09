"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"

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
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* Hero Section */}
        <HeroSection theme={theme} />

        {/* Features Section */}
        <FeaturesSection theme={theme} />

        {/* CTA Section */}
        <CTASection theme={theme} />
      </div>
    </Layout>
  )
}
