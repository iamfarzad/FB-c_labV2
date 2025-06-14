"use client"

import React from "react"
import { Mail, MessageSquare, Phone, MapPin, Clock, Zap } from "lucide-react"
import Link from "next/link"

interface ContactHeroProps {
  theme: "light" | "dark"
}

export const ContactHero: React.FC<ContactHeroProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const contactMethods = [
    {
      icon: <Mail className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Email",
      value: "hello@farzad.com",
      link: "mailto:hello@farzad.com",
      description: "Drop us a line anytime"
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Chat",
      value: "Start Live Chat",
      link: "#live-chat",
      description: "Chat with our team"
    },
    {
      icon: <Phone className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Phone",
      value: "+49 123 456 789",
      link: "tel:+49123456789",
      description: "Mon-Fri, 9am-5pm CET"
    },
    {
      icon: <MapPin className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Office",
      value: "Berlin, Germany",
      link: "https://maps.google.com",
      description: "Open in Maps"
    }
  ]

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
              <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
              <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Get In Touch</span>
            </div>
            
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${textColor} mb-6 leading-tight`}>
              Let&apos;s <span className="gradient-text">Work Together</span>
            </h1>
            
            <p className={`text-xl ${mutedTextColor} mb-8`}>
              Have questions about AI solutions for your business? Fill out the form or reach out directly. We&apos;d love to hear from you!
            </p>
            
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-0.5">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center">
                      {method.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-medium ${textColor}`}>{method.title}</h3>
                    <a 
                      href={method.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] transition-colors"
                    >
                      {method.value}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                    <p className={`text-sm ${mutedTextColor}`}>{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-8 border-t border-[var(--glass-border)]">
              <h3 className={`text-lg font-semibold ${textColor} mb-4`}>Business Hours</h3>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4 mt-0.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[var(--color-orange-accent)]" />
                  </div>
                </div>
                <div>
                  <p className={mutedTextColor}>
                    <span className="font-medium">Monday - Friday:</span> 9:00 AM - 6:00 PM CET<br />
                    <span className="font-medium">Weekend:</span> Closed
                  </p>
                  <p className={`text-sm ${mutedTextColor} mt-2`}>
                    We typically respond within 24 hours on business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${cardBg} ${cardBorder} border rounded-2xl p-6 md:p-8`}>
            <h2 className={`text-2xl font-bold ${textColor} mb-6`}>Send Us a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first-name" className={`block text-sm font-medium ${mutedTextColor} mb-2`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    className={`w-full px-4 py-3 rounded-lg border ${cardBorder} bg-transparent focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className={`block text-sm font-medium ${mutedTextColor} mb-2`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    className={`w-full px-4 py-3 rounded-lg border ${cardBorder} bg-transparent focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                    placeholder="Your last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${mutedTextColor} mb-2`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-4 py-3 rounded-lg border ${cardBorder} bg-transparent focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className={`block text-sm font-medium ${mutedTextColor} mb-2`}>
                  Subject *
                </label>
                <select
                  id="subject"
                  className={`w-full px-4 py-3 rounded-lg border ${cardBorder} bg-transparent focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors appearance-none`}
                  required
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
                <label htmlFor="message" className={`block text-sm font-medium ${mutedTextColor} mb-2`}>
                  Your Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border ${cardBorder} bg-transparent focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                  placeholder="How can we help you?"
                  required
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
                  <label htmlFor="privacy-policy" className={`${mutedTextColor}`}>
                    I agree to the <a href="/privacy" className="text-[var(--color-orange-accent)] hover:underline">privacy policy</a> and <a href="/terms" className="text-[var(--color-orange-accent)] hover:underline">terms of service</a>.
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-medium rounded-none text-white bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center">
                    Send Message
                    <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
            
            <div className="mt-8 pt-8 border-t border-[var(--glass-border)]">
              <p className={`text-sm text-center ${mutedTextColor}`}>
                By submitting this form, you agree to our{' '}
                <a href="/privacy" className="text-[var(--color-orange-accent)] hover:underline">Privacy Policy</a> and{' '}
                <a href="/terms" className="text-[var(--color-orange-accent)] hover:underline">Terms of Service</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
