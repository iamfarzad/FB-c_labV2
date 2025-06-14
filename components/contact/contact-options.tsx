"use client"

import React from "react"
import { Mail, Phone, MapPin, Clock, MessageSquare, Calendar, Zap, Linkedin, Twitter, Github, Youtube } from "lucide-react"
import Link from "next/link"

interface ContactOptionsProps {
  theme: "light" | "dark"
}

export const ContactOptions: React.FC<ContactOptionsProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const contactOptions = [
    {
      icon: <MessageSquare className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Live Chat",
      description: "Chat with our team in real-time",
      cta: "Start Chat",
      link: "#live-chat"
    },
    {
      icon: <Calendar className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Book a Call",
      description: "Schedule a 30-minute consultation",
      cta: "Book Now",
      link: "#book-call"
    },
    {
      icon: <Mail className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Email Us",
      description: "We'll respond within 24 hours",
      cta: "hello@farzad.com",
      link: "mailto:hello@farzad.com"
    },
    {
      icon: <Phone className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Call Us",
      description: "Mon-Fri, 9am-5pm CET",
      cta: "+49 123 456 789",
      link: "tel:+49123456789"
    },
    {
      icon: <MapPin className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Visit Us",
      description: "Our office in Berlin",
      cta: "Get Directions",
      link: "https://maps.google.com"
    },
    {
      icon: <Zap className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Quick Question?",
      description: "Check our FAQ section",
      cta: "View FAQs",
      link: "/faq"
    }
  ]

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      url: 'https://linkedin.com',
      color: 'text-[#0A66C2]',
      bg: 'bg-[#0A66C2]/10',
      hover: 'hover:bg-[#0A66C2]/20'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      url: 'https://twitter.com',
      color: 'text-[#1DA1F2]',
      bg: 'bg-[#1DA1F2]/10',
      hover: 'hover:bg-[#1DA1F2]/20'
    },
    {
      name: 'GitHub',
      icon: <Github className="h-5 w-5" />,
      url: 'https://github.com',
      color: 'text-gray-800 dark:text-gray-200',
      bg: 'bg-gray-200/50 dark:bg-gray-700/50',
      hover: 'hover:bg-gray-200/70 dark:hover:bg-gray-700/70'
    },
    {
      name: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
      url: 'https://youtube.com',
      color: 'text-[#FF0000]',
      bg: 'bg-[#FF0000]/10',
      hover: 'hover:bg-[#FF0000]/20'
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Contact Options</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            How Would You Like to <span className="gradient-text">Reach Us</span>?
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            Choose the most convenient way to get in touch with our team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {contactOptions.map((option, index) => (
            <div 
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col`}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                {option.icon}
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>{option.title}</h3>
              <p className={`${mutedTextColor} mb-6 flex-grow`}>{option.description}</p>
              <div>
                <a 
                  href={option.link} 
                  target={option.link.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] font-medium transition-colors"
                >
                  {option.cta}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12`}>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Connect With Us</h3>
              <p className={`${mutedTextColor} mb-8`}>
                Follow us on social media to stay updated with the latest news, tutorials, and insights about AI and technology.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full ${social.bg} ${social.hover} flex items-center justify-center transition-colors`}
                    aria-label={social.name}
                  >
                    <span className={social.color}>{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Join Our Newsletter</h3>
              <p className={`${mutedTextColor} mb-6`}>
                Subscribe to our newsletter for exclusive content, AI tips, and early access to new workshops and courses.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${cardBorder} bg-transparent focus:ring-2 focus:ring-[var(--color-orange-accent)] focus:border-transparent transition-colors`}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="newsletter-privacy"
                      name="privacy"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[var(--color-orange-accent)] focus:ring-[var(--color-orange-accent)]"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="newsletter-privacy" className={`${mutedTextColor}`}>
                      I agree to the <a href="/privacy" className="text-[var(--color-orange-accent)] hover:underline">privacy policy</a>.
                    </label>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-none text-white bg-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent-light)] transition-colors"
                  >
                    Subscribe to Newsletter
                  </button>
                </div>
              </form>
              
              <p className={`text-xs ${mutedTextColor} mt-4`}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
