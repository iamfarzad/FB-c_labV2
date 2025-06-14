"use client"

import React, { useState, useEffect } from "react"
import { Layout } from "@/components/layout"
import { ContactHero } from "../../components/contact/hero-section"
import { ContactOptions } from "../../components/contact/contact-options"
import { WhatToExpect } from "../../components/contact/what-to-expect"

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
      <div className="min-h-screen" style={{
        backgroundColor: theme === 'dark' ? 'var(--color-gunmetal)' : 'var(--color-light-silver)',
        color: theme === 'dark' ? 'var(--color-light-silver)' : 'var(--color-gunmetal)'
      }}>
        {/* Hero Section */}
        <ContactHero theme={theme} />
        
        {/* Contact Options */}
        <ContactOptions theme={theme} />
        
        {/* What to Expect */}
        <WhatToExpect theme={theme} />
        
        {/* Contact Form Section */}
        <section id="contact-form" className="py-20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Send Us a <span className="gradient-text">Message</span>
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto">
                Have a specific question? Fill out the form and we'll get back to you as soon as possible.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className={`rounded-2xl p-8 ${theme === 'dark' ? 'bg-[var(--glass-bg)] border border-[var(--glass-border)]' : 'bg-white shadow-xl'}`}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors bg-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors bg-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors bg-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="workshop">Workshop Information</option>
                      <option value="consulting">Consulting Services</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors bg-transparent"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="privacy-policy"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[var(--color-orange-accent)] focus:ring-[var(--color-orange-accent)]"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="privacy-policy" className="opacity-80">
                        I agree to the <a href="/privacy" className="text-[var(--color-orange-accent)] hover:underline">privacy policy</a> and <a href="/terms" className="text-[var(--color-orange-accent)] hover:underline">terms of service</a>.
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-medium rounded-none text-white bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative flex items-center">
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                        <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </button>
                  </div>
                  
                  {submitStatus === "success" && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                      Message sent successfully! We'll get back to you soon.
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      Failed to send message. Please try again.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
