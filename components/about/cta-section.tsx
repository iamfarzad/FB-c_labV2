"use client"

import React from "react"
import { ArrowRight, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"

interface CTASectionProps {
  theme: "light" | "dark"
}

export const CTASection: React.FC<CTASectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Let's Work Together</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${textColor} mb-6 max-w-4xl mx-auto leading-tight`}>
            Ready to Transform Your Business with <span className="gradient-text">AI Solutions</span>?
          </h2>

          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto mb-10`}>
            Whether you have a project in mind or just want to explore how AI can benefit your business, I'm here to help.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group relative overflow-hidden px-8 py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center space-x-3">
                <span>Get a Free Consultation</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Link>

            <Link
              href="/consulting"
              className="group inline-flex items-center px-6 py-4 rounded-none border border-[var(--glass-border)] text-lg font-medium hover:bg-[var(--glass-bg)] transition-colors duration-300"
            >
              <MessageSquare className="h-5 w-5 mr-2 text-[var(--color-orange-accent)]" />
              <span>View Consulting</span>
            </Link>
          </div>

          <div className="mt-12 pt-12 border-t border-[var(--glass-border)]">
            <p className={`text-sm ${mutedTextColor} mb-6`}>
              Not sure where to start? Here's how I can help:
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <Zap className="h-5 w-5 text-[var(--color-orange-accent)]" />,
                  title: "AI Strategy",
                  description: "Identify the best AI opportunities for your business"
                },
                {
                  icon: <MessageSquare className="h-5 w-5 text-[var(--color-orange-accent)]" />,
                  title: "Custom Solutions",
                  description: "Build tailored AI solutions that solve your specific challenges"
                },
                {
                  icon: <Zap className="h-5 w-5 text-[var(--color-orange-accent)]" />,
                  title: "Team Training",
                  description: "Upskill your team with practical AI knowledge and tools"
                }
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 mb-4 mx-auto">
                    {item.icon}
                  </div>
                  <h3 className={`text-lg font-semibold ${textColor} mb-2`}>{item.title}</h3>
                  <p className={`text-sm ${mutedTextColor}`}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
