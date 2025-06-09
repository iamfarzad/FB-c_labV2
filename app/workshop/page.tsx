"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"

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
        className="min-h-screen py-20"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">AI Workshop</h1>
            <p className="text-xl text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto">
              Join our hands-on workshops to learn AI implementation and best practices.
            </p>
          </div>

          <div className="mt-16 space-y-8">
            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Upcoming Workshops</h2>
              <p className="text-[var(--text-primary)] opacity-80 leading-relaxed">
                Workshop schedules and content will be added here.
              </p>
            </div>

            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Workshop Topics</h2>
              <p className="text-[var(--text-primary)] opacity-80 leading-relaxed">
                Detailed workshop curriculum and learning objectives will be added here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
