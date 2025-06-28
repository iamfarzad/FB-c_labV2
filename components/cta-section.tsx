"use client"

import type React from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { CTAButton } from "@/components/ui/CTAButton"

interface CTASectionProps {
  theme: "light" | "dark"
  onStartChat: () => void
}

export const CTASection: React.FC<CTASectionProps> = ({ theme, onStartChat }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/5" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-orange-accent)]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="glassmorphism rounded-3xl p-12 space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] shadow-2xl">
              <Sparkles size={32} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">
              Ready to Transform Your Workflow?
            </h2>
            <p className={`text-lg sm:text-xl ${mutedTextColor} max-w-2xl mx-auto`}>
              Join thousands of users who have revolutionized their productivity with F.B/c AI. Start your journey
              today.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <CTAButton href="/chat" withArrow>
              Get Started Free
            </CTAButton>
            <CTAButton variant="tertiary" size="sm">
              Schedule Demo
            </CTAButton>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-[var(--glass-border)]">
            <p className={`text-sm ${mutedTextColor} mb-4`}>Trusted by leading companies worldwide</p>
            <div className="flex items-center justify-center space-x-8 opacity-50">
              {/* Placeholder for company logos */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded opacity-30" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
