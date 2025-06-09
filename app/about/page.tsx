"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"

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
        className="min-h-screen py-20"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">About F.B/c AI</h1>
            <p className="text-xl text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto">
              Learn about our mission, vision, and the team behind the intelligent assistant platform.
            </p>
          </div>

          <div className="mt-16 space-y-12">
            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Our Mission</h2>
              <p className="text-[var(--text-primary)] opacity-80 leading-relaxed">
                Content will be added here about the company mission and values.
              </p>
            </div>

            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Our Team</h2>
              <p className="text-[var(--text-primary)] opacity-80 leading-relaxed">
                Content will be added here about the team members and their expertise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
