"use client"

import React from "react"
import { Zap, CheckCircle, Clock, Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CTAButton } from "@/components/ui/CTAButton"
import { SectionBadge } from "@/components/ui/SectionBadge"

interface CTASectionProps {
  theme: "light" | "dark"
}

export const CTASection: React.FC<CTASectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const workshopDetails = [
    {
      icon: <Calendar className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Date",
      value: "June 25, 2024"
    },
    {
      icon: <Clock className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Time",
      value: "10:00 AM - 4:00 PM CET"
    },
    {
      icon: <MapPin className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Location",
      value: "Online & In-Person (Berlin)"
    },
    {
      icon: <Users className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      title: "Seats",
      value: "Limited to 15 participants"
    }
  ]

  return (
    <section id="register" className="py-20 relative bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionBadge icon={<Zap className="h-5 w-5 text-[var(--color-orange-accent)]" />}>
              Reserve Your Spot
            </SectionBadge>
            <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
              Ready to Master <span className="gradient-text">AI for Business</span>?
            </h2>
            <p className={`text-xl ${mutedTextColor} mb-8`}>
              Join our next workshop and gain practical AI skills you can apply immediately to boost your productivity and business results.
            </p>

            <div className="space-y-6 mb-8">
              {workshopDetails.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center mr-4">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-orange-accent)]">{item.title}</div>
                    <div className={`font-medium ${textColor}`}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <CTAButton href="#pricing" withArrow className="w-full flex justify-center">
                Reserve My Spot Now
              </CTAButton>
              <p className={`text-center text-sm ${mutedTextColor}`}>
                Secure your spot now. Only a few seats remaining!
              </p>
            </div>
          </div>

          <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8`}>
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>What's Included</h3>
            <ul className="space-y-4 mb-8">
              {[
                "Full-day workshop (6 hours of training)",
                "All workshop materials and resources",
                "Hands-on exercises with real-world examples",
                "Certificate of completion",
                "30-day access to workshop recordings",
                "Exclusive access to private community",
                "Follow-up Q&A session",
                "Lifetime access to course updates"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                    <CheckCircle className="h-3 w-3 text-[var(--color-orange-accent)]" />
                  </div>
                  <span className={mutedTextColor}>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/10 border border-[var(--glass-border)]">
              <h4 className={`font-bold ${textColor} mb-3 flex items-center`}>
                <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                Special Bonus for Early Birds
              </h4>
              <p className={`${mutedTextColor} mb-4`}>
                Register now and receive these exclusive bonuses (worth $297):
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "1-hour 1:1 AI Strategy Session",
                  "AI Tools Cheat Sheet",
                  "Custom AI Implementation Plan",
                  "30-minute Follow-up Call"
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mr-2" />
                    <span className={mutedTextColor}>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--color-orange-accent)]/10">
                  <Clock className="h-4 w-4 text-[var(--color-orange-accent)] mr-2" />
                  <span className="text-sm font-medium text-[var(--color-orange-accent)]">Offer ends in 3 days</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className={`text-sm ${mutedTextColor} mb-4`}>
                Have questions about the workshop?
              </p>
              <a
                href="#contact"
                className="inline-flex items-center text-sm font-medium text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] transition-colors"
              >
                Contact us for more information
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-[var(--glass-border)]">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Not Sure If This Workshop Is Right For You?</h3>
            <p className={`text-xl ${mutedTextColor} mb-8`}>
              Book a free 15-minute discovery call to discuss your goals and see if this workshop is the right fit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <CTAButton href="#book-call" variant="tertiary" size="sm">
                Book a Free Call
              </CTAButton>
              <CTAButton href="/faq" variant="secondary" size="sm">
                View FAQ
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
