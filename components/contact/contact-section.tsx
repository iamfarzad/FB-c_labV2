"use client"

import React, { useState } from "react"
import { Mail, Linkedin, Twitter, Github } from "lucide-react"
import Link from "next/link"

interface ContactSectionProps {
  theme: "light" | "dark"
}

export const ContactSection: React.FC<ContactSectionProps> = ({ theme }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/80" : "text-[var(--color-gunmetal)]/80"
  const inputBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const inputBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitStatus("success")
      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      url: 'https://linkedin.com',
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      url: 'https://twitter.com',
    },
    {
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      url: 'https://github.com',
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      url: 'mailto:hello@farzad.com',
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className={`text-3xl font-bold ${textColor} mb-4`}>
          Get in Touch
        </h2>
        <p className={`text-lg ${mutedTextColor} max-w-2xl mx-auto`}>
          Have a question or want to work together? Send me a message and I'll get back to you as soon as possible.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${mutedTextColor}`}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${inputBorder} ${inputBg} focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${mutedTextColor}`}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${inputBorder} ${inputBg} focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className={`block text-sm font-medium mb-1 ${mutedTextColor}`}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-2 rounded-lg border ${inputBorder} ${inputBg} focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                placeholder="How can I help you?"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-[var(--color-orange-accent)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>

            {/* Social Media Icons */}
            <div className="pt-4">
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-400">or connect with me</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="flex justify-center space-x-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[var(--glass-bg)]' : 'bg-gray-50'} hover:bg-[var(--color-orange-accent)]/10 transition-colors`}
                    aria-label={link.name}
                  >
                    {React.cloneElement(link.icon, {
                      className: `h-5 w-5 ${theme === 'dark' ? 'text-[var(--color-light-silver)]' : 'text-[var(--color-gunmetal)]'} hover:text-[var(--color-orange-accent)] transition-colors`
                    })}
                  </a>
                ))}
              </div>
            </div>

            {submitStatus === "success" && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                Message sent successfully! I'll get back to you soon.
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
  )
}
