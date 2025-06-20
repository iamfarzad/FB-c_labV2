"use client"

import React from "react"
import { ArrowRight, Zap, Calendar, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

interface FreeWorkshopProps {
  theme: "light" | "dark"
}

export const FreeWorkshop: React.FC<FreeWorkshopProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"
  const highlightBg = theme === "dark" ? "bg-gradient-to-r from-[var(--color-orange-accent)]/10 to-[var(--color-orange-accent)]/5" : "bg-gradient-to-r from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent)]/10"

  const workshopDetails = [
    {
      icon: Clock,
      title: "30 Minutes",
      description: "Quick and focused session"
    },
    {
      icon: Zap,
      title: "No Fluff",
      description: "Just working examples"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book at your convenience"
    }
  ]

  const benefits = [
    "Learn what AI can/can't do for your business",
    "Automate one real task using ChatGPT or Claude",
    "No slides, no fluff. Just working examples"
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${cardBg} ${cardBorder} border rounded-2xl overflow-hidden`}>
          <div className="grid md:grid-cols-2">
            {/* Left side - Content */}
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
                <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Free Digital Workshop</span>
              </div>

              <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
                Get a real taste of how AI can help your business
              </h2>

              <p className={`text-lg ${mutedTextColor} mb-8`}>
                In just 30 minutes, discover how AI can transform your workflow with practical, hands-on examples.
              </p>

              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-[var(--color-orange-accent)] flex-shrink-0 mt-1 mr-3" />
                    <span className={mutedTextColor}>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/workshop"
                className="group inline-flex items-center px-6 py-3.5 rounded-none bg-[var(--color-orange-accent)] text-white font-semibold hover:bg-[var(--color-orange-accent-light)] transition-all duration-300"
              >
                <span>Join Free Workshop</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right side - Visuals */}
            <div className={`${highlightBg} p-8 md:p-12 flex flex-col justify-center`}>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {workshopDetails.map((detail, index) => (
                  <div key={index} className={`${cardBg} ${cardBorder} border rounded-xl p-4 text-center`}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white mb-3 mx-auto">
                      <detail.icon className="h-5 w-5" />
                    </div>
                    <h4 className={`font-semibold ${textColor} mb-1`}>{detail.title}</h4>
                    <p className={`text-sm ${mutedTextColor}`}>{detail.description}</p>
                  </div>
                ))}
              </div>

              <div className="relative h-48 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/20 to-[var(--color-orange-accent-light)]/20 rounded-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] flex items-center justify-center text-white mx-auto mb-4">
                      <Zap className="h-8 w-8" />
                    </div>
                    <p className={`text-sm font-medium ${textColor}`}>Limited spots available</p>
                    <p className="text-xs text-[var(--color-orange-accent)] font-medium">Book your session today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
