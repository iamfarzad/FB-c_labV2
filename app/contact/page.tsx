"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Layout } from "@/components/layout"

export default function ContactPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
  }, [theme])

  // Add state for form handling
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitStatus("success")
      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">Contact Us</h1>
            <p className="text-xl text-[var(--text-primary)] opacity-80 max-w-2xl mx-auto">
              Get in touch with our team to discuss your AI needs and solutions.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl glassmorphism focus:ring-2 focus:ring-[var(--color-orange-accent)]/30 text-[var(--text-primary)]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl glassmorphism focus:ring-2 focus:ring-[var(--color-orange-accent)]/30 text-[var(--text-primary)]"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl glassmorphism focus:ring-2 focus:ring-[var(--color-orange-accent)]/30 text-[var(--text-primary)]"
                    placeholder="Your message"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl glass-button text-[var(--color-text-on-orange)] font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                {submitStatus === "success" && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    Failed to send message. Please try again.
                  </div>
                )}
              </form>
            </div>

            <div className="glassmorphism rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Contact Information</h2>
              <div className="space-y-4">
                <p className="text-[var(--text-primary)] opacity-80">
                  Contact details and office information will be added here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
