"use client"

import React from "react"
import { CheckCircle, Zap, Clock, Users, Award, BookOpen } from "lucide-react"

interface WhatToExpectProps {
  theme: "light" | "dark"
}

export const WhatToExpect: React.FC<WhatToExpectProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Hands-on Learning",
      description: "Practical exercises to apply what you learn in real-time"
    },

    {
      icon: <Users className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Interactive Learning",
      description: "Engaging activities and personalized attention"
    },
    {
      icon: <Award className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Certificate of Completion",
      description: "Showcase your new skills with a verifiable certificate"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Comprehensive Materials",
      description: "All resources and templates included for future reference"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Ongoing Support",
      description: "Access to resources and support after the workshop"
    }
  ]

  return (
    <section id="workshop-details" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <CheckCircle className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Workshop Details</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            What to <span className="gradient-text">Expect</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            A focused, hands-on learning experience designed to give you practical AI skills you can apply immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-2`}>{feature.title}</h3>
              <p className={mutedTextColor}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12`}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Who Should Attend</h3>
              <p className={`${mutedTextColor} mb-6`}>
                This workshop is perfect for business owners, managers, and professionals who want to leverage AI to improve their work, regardless of their technical background.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Business owners & entrepreneurs",
                  "Managers & team leads",
                  "Marketing & sales professionals",
                  "Operations & HR professionals",
                  "Anyone curious about AI applications"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                    </div>
                    <span className={mutedTextColor}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/10 rounded-2xl p-8 border border-[var(--glass-border)]">
              <h4 className={`text-lg font-semibold ${textColor} mb-4`}>Prerequisites</h4>
              <p className={`${mutedTextColor} mb-6`}>
                No prior AI or programming experience is required. Just bring your laptop and enthusiasm to learn!
              </p>
              <div className="space-y-4">
                <div>
                  <h5 className={`font-medium ${textColor} mb-2`}>What to Bring</h5>
                  <ul className="space-y-2">
                    {["Laptop (Windows/Mac)", "Notebook & pen", "Open mind and curiosity"].map((item, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mr-2" />
                        <span className={mutedTextColor}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className={`font-medium ${textColor} mb-2`}>What&apos;s Included</h5>
                  <ul className="space-y-2">
                    {["Workshop materials", "Digital certificate", "Support access", "Refreshments"].map((item, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mr-2" />
                        <span className={mutedTextColor}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
