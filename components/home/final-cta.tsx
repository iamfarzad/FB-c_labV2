"use client"

import React from "react"
import { ArrowRight, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"

interface FinalCTAProps {
  theme: "light" | "dark"
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-12 text-center`}>
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white mb-8 mx-auto">
              <Zap className="h-8 w-8" />
            </div>

            <h2 className={`text-4xl sm:text-5xl font-bold ${textColor} mb-6`}>
              Ready to See What AI Can <span className="gradient-text">Really</span> Do?
            </h2>

            <p className={`text-xl ${mutedTextColor} mb-8 max-w-2xl mx-auto`}>
              Let's identify your best use case and get started with AI that delivers business value—today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="group relative overflow-hidden px-8 py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-white" />
                  <span>Start Your AI Journey</span>
                  <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>

              <Link
                href="/ai-demo"
                className="group flex items-center text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] font-medium text-lg"
              >
                <span>Try a Free Demo</span>
                <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
