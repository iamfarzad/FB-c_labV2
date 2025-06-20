"use client"

import React, { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { ContactSection } from "../../components/contact/contact-section"
import { WarpBackground } from "@/components/magicui/warp-background"

export default function ContactPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or use system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

      if (savedTheme) {
        setTheme(savedTheme)
      } else if (systemPrefersDark) {
        setTheme('dark')
      }
    }
  }, [])

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme)

      // Save theme preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme)
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light"
      return newTheme
    })
  }

  // Add smooth scrolling for anchor links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLAnchorElement
        if (target.matches('a[href^="#"]')) {
          e.preventDefault()
          const id = target.getAttribute('href')
          if (id && id !== '#') {
            const element = document.querySelector(id)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }
      }


      document.addEventListener('click', handleAnchorClick)
      return () => document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  // Form handling state
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
      <div className="relative min-h-screen py-12 overflow-hidden" style={{
        backgroundColor: theme === 'dark' ? 'var(--color-gunmetal)' : 'var(--color-light-silver)',
        color: theme === 'dark' ? 'var(--color-light-silver)' : 'var(--color-gunmetal)'
      }}>
        {/* Warp Background */}
        <WarpBackground
          perspective={1000}
          beamsPerSide={5}
          beamSize={5}
          beamDelayMax={3}
          beamDelayMin={0}
          beamDuration={3}
          gridColor={theme === 'dark' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
          className="absolute inset-0 z-0 pointer-events-none opacity-70"
        >
          <div className="absolute inset-0" />
        </WarpBackground>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent" />
        </div>

        <div className="relative z-10">
          <ContactSection theme={theme} />
        </div>
      </div>
    </Layout>
  )
}
