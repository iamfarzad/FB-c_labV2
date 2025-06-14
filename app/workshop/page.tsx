"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { WorkshopHero as HeroSection } from "@/components/workshop/hero-section"
import { WhatToExpect } from "@/components/workshop/what-to-expect"
import { FormatSection } from "@/components/workshop/format-section"
import { ToolsSection } from "@/components/workshop/tools-section"
import { DeliverySection } from "@/components/workshop/delivery-section"
import { WhyItWorks } from "@/components/workshop/why-it-works"
import { CTASection as CtaSection } from "@/components/workshop/cta-section"

export default function WorkshopPage() {
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
        
        {/* What to Expect Section */}
        <WhatToExpect theme={theme} />
        
        {/* Workshop Format Section */}
        <FormatSection theme={theme} />
        
        {/* Tools Section */}
        <ToolsSection theme={theme} />
        
        {/* Delivery Options Section */}
        <DeliverySection theme={theme} />
        
        {/* Why It Works Section */}
        <WhyItWorks theme={theme} />
        
        {/* CTA Section */}
        <CtaSection theme={theme} />
      </div>
    </Layout>
  )
}
