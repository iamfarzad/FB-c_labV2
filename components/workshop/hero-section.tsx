"use client"

import React from "react"
import { ArrowRight, Calendar, Clock, Zap } from "lucide-react"
import Link from "next/link"

interface WorkshopHeroProps {
  theme: "light" | "dark"
}

export const WorkshopHero: React.FC<WorkshopHeroProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
              <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
              <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Free Workshop</span>
            </div>
            
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${textColor} mb-6 leading-tight`}>
              Master <span className="gradient-text">AI for Business</span> in Just One Day
            </h1>
            
            <p className={`text-xl ${mutedTextColor} mb-8`}>
              Join my free 1-day workshop and learn how to implement AI solutions that drive real business results. No technical experience required.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center bg-[var(--color-orange-accent)]/10 px-4 py-2 rounded-lg">
                <Calendar className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                <span className={mutedTextColor}>Next Session: June 25, 2024</span>
              </div>
              <div className="flex items-center bg-[var(--color-orange-accent)]/10 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                <span className={mutedTextColor}>10:00 AM - 4:00 PM CET</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="#register" 
                className="group relative overflow-hidden px-8 py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center space-x-3">
                  <span>Reserve Your Spot</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
              
              <Link 
                href="#workshop-details" 
                className="group inline-flex items-center justify-center px-8 py-4 rounded-none border border-[var(--glass-border)] text-lg font-medium hover:bg-[var(--glass-bg)] transition-colors duration-300"
              >
                <span>Learn More</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <p className={`text-sm ${mutedTextColor} mt-4 flex items-center`}>
              <svg className="h-4 w-4 text-[var(--color-orange-accent)] mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Limited seats available. Registration is free but required.
            </p>
          </div>
          
          <div className={`${cardBg} ${cardBorder} border rounded-2xl p-6 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent-light)]/10 -z-10" />
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden mb-6">
                <div className="w-full h-full bg-gradient-to-br from-[var(--color-orange-accent)]/10 to-[var(--color-orange-accent-light)]/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] mx-auto mb-6 flex items-center justify-center">
                      <Zap className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">AI Workshop</h3>
                    <p className="text-white/80 mt-2">Free 1-Day Intensive</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className={`text-xl font-bold ${textColor}`}>What You'll Get:</h3>
                <ul className="space-y-3">
                  {[
                    "6 hours of hands-on training",
                    "Live Q&A session",
                    "Workshop materials & resources",
                    "Certificate of completion",
                    "30-day support access"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                      </div>
                      <span className={mutedTextColor}>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4 border-t border-[var(--glass-border)]">
                  <p className={`text-sm ${mutedTextColor} mb-4`}>
                    <Zap className="inline-block h-4 w-4 text-[var(--color-orange-accent)] mr-1" />
                    Next session starts in <span className="font-semibold text-[var(--color-orange-accent)]">14 days</span>
                  </p>
                  <Link 
                    href="#register" 
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-none text-white bg-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent-light)] transition-colors"
                  >
                    Join the Waitlist
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
