"use client"

import React from "react"
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { SectionLayout } from "@/components/layouts/section-layout"

interface WhyWorkWithMeProps {
  theme: "light" | "dark"
}

const sections: Array<{id: string, title: string, scrollOffset?: number}> = [
  { id: 'why-work-with-me', title: 'Why Work With Me', scrollOffset: 0 }
]

export const WhyWorkWithMe: React.FC<WhyWorkWithMeProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const borderColor = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"
  const cardBg = theme === "dark" ? "bg-[var(--color-gunmetal-lighter)]" : "bg-white"
  const hoverBg = theme === "dark" ? "hover:bg-[var(--color-gunmetal-light-alpha)]" : "hover:bg-gray-50"

  const reasons = [
    {
      title: "Proven Expertise",
      description: "10,000+ hours building practical AI solutions since 2020",
      icon: <Sparkles className="h-6 w-6 text-[var(--color-orange-accent)]" />
    },
    {
      title: "Results-Driven",
      description: "Focus on real business outcomes, not just technology",
      icon: <CheckCircle className="h-6 w-6 text-[var(--color-orange-accent)]" />
    },
    {
      title: "Industry Experience",
      description: "Hands-on experience across multiple industries and use cases",
      icon: <CheckCircle className="h-6 w-6 text-[var(--color-orange-accent)]" />
    },
    {
      title: "Track Record",
      description: "Consistently delivering measurable results for clients",
      icon: <CheckCircle className="h-6 w-6 text-[var(--color-orange-accent)]" />
    }
  ]

  return (
    <SectionLayout 
      sections={sections}
      sideTextPosition="left"
      className={`space-y-0 ${theme === 'dark' ? 'bg-[var(--color-gunmetal)]' : 'bg-[var(--color-light-silver)]'}`}
    >
      {/* Why Work With Me Section */}
      <div id="why-work-with-me" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-5">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ff5b04\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }}
          />
        </div>
          
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`grid md:grid-cols-2 gap-12 items-start ${borderColor} border-t pt-16`}>
            <div className="space-y-6 relative">
              <div className="inline-flex items-center px-4 py-2 rounded-sm bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 relative overflow-hidden group">
                <span className="absolute inset-0 bg-[var(--color-orange-accent)]/5 group-hover:bg-[var(--color-orange-accent)]/20 transition-all duration-300"></span>
                <span className="relative text-sm font-mono text-[var(--color-orange-accent)] uppercase tracking-wider">Why Work With Me</span>
              </div>
                
              <h2 className={`text-4xl sm:text-5xl font-bold ${textColor} leading-tight`}>
                Why <span className="relative inline-block">
                  <span className="relative z-10">Businesses Choose Me</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-[var(--color-orange-accent)]/20 -z-0 transform -rotate-1"></span>
                </span>
              </h2>
                
              <p className={`text-lg ${mutedTextColor} max-w-lg relative`}>
                I bring a unique combination of technical expertise and business acumen to deliver AI solutions that drive real impact.
                <span className="absolute -left-6 top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-[var(--color-orange-accent)] to-transparent"></span>
              </p>
            
              <Link 
                href="/about" 
                className="group inline-flex items-center text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] transition-all duration-300 relative"
              >
                <span className="font-semibold relative before:content-[''] before:absolute before:w-0 before:h-0.5 before:bottom-0 before:left-0 before:bg-[var(--color-orange-accent-light)] before:transition-all before:duration-300 group-hover:before:w-full">
                  See My Approach
                </span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {reasons.map((reason, index) => (
                <div 
                  key={index} 
                  className={`p-8 rounded-lg ${cardBg} border ${borderColor} shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${hoverBg}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-[var(--color-orange-accent)]/10 rounded-full">
                      {reason.icon}
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 ${textColor}`}>{reason.title}</h3>
                      <p className={mutedTextColor}>{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionLayout>
  )
}
