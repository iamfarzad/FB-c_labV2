"use client"

import type React from "react"
import Link from "next/link"
import { MessageSquare, Mail, Phone, MapPin, Github, Twitter, Linkedin, Youtube } from "lucide-react"
import { LegalDialog } from "@/components/ui/legal-dialog"
import { Button } from "@/components/ui/button" // Import Button component

interface FooterProps {
  // theme prop is no longer needed as we'll use Tailwind's dark mode
}

export const Footer: React.FC<FooterProps> = () => {
  // footerBg, textColor, mutedTextColor are removed. Styling will be done via Tailwind dark mode.
  // Assumed:
  // Light mode footer: bg-white, border-light-silver-darker
  // Dark mode footer: bg-gunmetal, border-gunmetal-lighter
  // Text: text-gunmetal (light), text-light-silver (dark) -> maps to text-foreground
  // Muted Text: text-gunmetal/90 (light), text-light-silver/90 (dark) -> maps to text-muted-foreground or text-foreground/90

  // Legal content for dialogs
  const legalContent = {
    privacy: (
      <div className="space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          At F.B/c AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
        </p>
        <h3 className="font-semibold">Information We Collect</h3>
        <p>
          We may collect personal information such as your name, email address, and usage data when you interact with our services.
        </p>
        <h3 className="font-semibold">How We Use Your Information</h3>
        <p>
          Your information is used to provide and improve our services, communicate with you, and ensure the security of our platform.
        </p>
      </div>
    ),
    terms: (
      <div className="space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          By accessing or using our services, you agree to be bound by these Terms of Service. Please read them carefully.
        </p>
        <h3 className="font-semibold">Use of Services</h3>
        <p>
          You agree to use our services only for lawful purposes and in accordance with these Terms and all applicable laws and regulations.
        </p>
        <h3 className="font-semibold">Intellectual Property</h3>
        <p>
          All content and materials available on our platform are the property of F.B/c AI and are protected by intellectual property laws.
        </p>
      </div>
    ),
    cookies: (
      <div className="space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          We use cookies and similar tracking technologies to enhance your experience on our website.
        </p>
        <h3 className="font-semibold">What Are Cookies</h3>
        <p>
          Cookies are small text files that are stored on your device when you visit our website. They help us remember your preferences and understand how you use our site.
        </p>
        <h3 className="font-semibold">Managing Cookies</h3>
        <p>
          You can control and manage cookies in your browser settings. However, disabling cookies may affect your experience on our website.
        </p>
      </div>
    ),
    gdpr: (
      <div className="space-y-4">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          F.B/c AI is committed to complying with the General Data Protection Regulation (GDPR) and protecting the privacy of our users.
        </p>
        <h3 className="font-semibold">Your Rights</h3>
        <p>
          Under GDPR, you have the right to access, correct, or delete your personal data. You may also request a copy of your data or restrict its processing.
        </p>
        <h3 className="font-semibold">Data Protection</h3>
        <p>
          We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.
        </p>
      </div>
    ),
  }

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Consulting", href: "/consulting" },
      { name: "Workshop", href: "/workshop" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", id: "privacy" },
      { name: "Terms of Service", id: "terms" },
      { name: "Cookie Policy", id: "cookies" },
      { name: "GDPR", id: "gdpr" },
    ],
  }

  const contactInfo = [
    { text: "contact@farzadbayat.com", icon: Mail },
    { text: "+47 94446446", icon: Phone },
    { text: "Oslo/Norway", icon: MapPin }
  ]

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
  ]

  return (
    <footer className="glassmorphism bg-white dark:bg-gunmetal border-t border-light-silver-darker dark:border-gunmetal-lighter backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-accent to-orange-accent-light flex items-center justify-center shadow-lg">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold gradient-text">F.B/c AI</h3>
                <p className="text-xs text-muted-foreground">Intelligent Assistant</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering businesses with cutting-edge AI solutions. Transform your workflow with our intelligent
              assistant platform.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-orange-accent transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <item.icon size={16} className="text-orange-accent" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <LegalDialog
                    title={link.name}
                    trigger={
                      <button
                        className="text-sm text-muted-foreground hover:text-orange-accent transition-colors duration-200 text-left"
                      >
                        {link.name}
                      </button>
                    }
                  >
                    {legalContent[link.id as keyof typeof legalContent]}
                  </LegalDialog>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="py-8 border-t border-border/50"> {/* Use border-border/50 for glass consistency */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Get the latest updates on AI innovations and product releases.
              </p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-xl glassmorphism focus:ring-2 focus:ring-orange-accent/30 text-foreground placeholder-foreground/50 transition-all duration-300"
              />
              <Button variant="glass" className="text-text-on-orange font-medium"> {/* Use Button component */}
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"> {/* Use border-border/50 */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} F.B/c AI. All rights reserved.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg glassmorphism hover:surface-glow transition-all duration-300 text-foreground group"
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
