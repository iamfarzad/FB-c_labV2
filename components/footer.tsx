"use client"

import type React from "react"
import Link from "next/link"
import { MessageSquare, Mail, Phone, MapPin, Github, Twitter, Linkedin, Youtube } from "lucide-react"

interface FooterProps {
  theme: "light" | "dark"
}

export const Footer: React.FC<FooterProps> = ({ theme }) => {
  const footerBg =
    theme === "dark"
      ? "bg-[var(--color-gunmetal)] border-[var(--color-gunmetal-lighter)]"
      : "bg-white border-[var(--color-light-silver-darker)]"

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Services", href: "/services" },
      { name: "Workshop", href: "/workshop" },
      { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Blog", href: "/blog" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  }

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
  ]

  return (
    <footer className={`glassmorphism ${footerBg} border-t backdrop-blur-xl`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] flex items-center justify-center shadow-lg">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">F.B/c AI</h3>
                <p className={`text-xs ${mutedTextColor}`}>Intelligent Assistant</p>
              </div>
            </div>
            <p className={`text-sm ${mutedTextColor} leading-relaxed`}>
              Empowering businesses with cutting-edge AI solutions. Transform your workflow with our intelligent
              assistant platform.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-[var(--color-orange-accent)]" />
                <span className={`text-sm ${textColor}`}>contact@fbcai.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-[var(--color-orange-accent)]" />
                <span className={`text-sm ${textColor}`}>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-[var(--color-orange-accent)]" />
                <span className={`text-sm ${textColor}`}>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className={`text-sm font-semibold ${textColor} mb-4 uppercase tracking-wider`}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm ${mutedTextColor} hover:text-[var(--color-orange-accent)] transition-colors duration-200`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className={`text-sm font-semibold ${textColor} mb-4 uppercase tracking-wider`}>Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm ${mutedTextColor} hover:text-[var(--color-orange-accent)] transition-colors duration-200`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className={`text-sm font-semibold ${textColor} mb-4 uppercase tracking-wider`}>Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm ${mutedTextColor} hover:text-[var(--color-orange-accent)] transition-colors duration-200`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-[var(--glass-border)]">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h4 className={`text-lg font-semibold ${textColor} mb-2`}>Stay Updated</h4>
              <p className={`text-sm ${mutedTextColor}`}>
                Get the latest updates on AI innovations and product releases.
              </p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-xl glassmorphism focus:ring-2 focus:ring-[var(--color-orange-accent)]/30 text-[var(--text-primary)] placeholder-[var(--text-primary)]/50 transition-all duration-300"
              />
              <button className="px-6 py-2 rounded-xl glass-button text-[var(--color-text-on-orange)] font-medium transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-[var(--glass-border)] flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <p className={`text-sm ${mutedTextColor}`}>© {new Date().getFullYear()} F.B/c AI. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
                aria-label={social.name}
              >
                <social.icon size={16} className="group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
