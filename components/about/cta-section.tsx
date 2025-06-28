"use client"

import React from "react"
import { ArrowRight, MessageSquare, Zap } from "lucide-react"
import Link from "next/link"
import { CTAButton } from "@/components/ui/CTAButton"
import { SectionBadge } from "@/components/ui/SectionBadge"
import { FeatureCard } from "@/components/ui/FeatureCard"

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
          <SectionBadge icon={<Zap className="h-5 w-5 text-[var(--color-orange-accent)]" />}>
            Let's Work Together
          </SectionBadge>

          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${textColor} mb-6 max-w-4xl mx-auto leading-tight`}>
            Ready to Transform Your Business with <span className="gradient-text">AI Solutions</span>?
          </h2>

          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto mb-10`}>
            Whether you have a project in mind or just want to explore how AI can benefit your business, I'm here to help.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton href="/contact" withArrow>
              Get a Free Consultation
            </CTAButton>
            <CTAButton href="/consulting" variant="secondary">
              <MessageSquare className="h-5 w-5 mr-2 text-[var(--color-orange-accent)]" />
              <span>View Consulting</span>
            </CTAButton>
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
                <FeatureCard
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
