"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
// import HeroEnhanced from "@/components/magicui/hero-enhanced"
import { ServicesHero } from "@/components/consulting/hero-section"
import { AIConsulting } from "@/components/consulting/ai-consulting"
import { Workshops } from "@/components/consulting/workshops"
import { Tools } from "@/components/consulting/tools"
import { Process } from "@/components/consulting/process"

export default function ServicesPage() {
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
        className="relative pt-20"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* Hero Section with TextParticle */}
        <ServicesHero theme={theme} />

        {/* AI Consulting Section */}
        <AIConsulting theme={theme} />

        {/* Process Section */}
        <Process theme={theme} />

        {/* Tools Section */}
        <Tools theme={theme} />

        {/* Workshops Section */}
        <Workshops theme={theme} />
      </div>
    </Layout>
  )
}
