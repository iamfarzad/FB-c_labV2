"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"

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
        className="min-h-screen py-20"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">Our Services</h1>
            <p className="text-xl text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto">
              Discover our comprehensive AI solutions designed to transform your business.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="glassmorphism rounded-2xl p-6 hover:surface-glow transition-all duration-300">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Service {item}</h3>
                <p className="text-[var(--text-primary)] opacity-80 leading-relaxed">
                  Service description and details will be added here.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
