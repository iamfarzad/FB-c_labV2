"use client"

import React from "react"
import { ArrowRight, Calendar, Clock, Users, Zap, Check } from "lucide-react"
import Link from "next/link"

interface WorkshopsProps {
  theme: "light" | "dark"
}

export const Workshops: React.FC<WorkshopsProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const workshopStructure = [
    {
      icon: Clock,
      title: "3 hours theory",
      description: "Clear, no-jargon overview of LLMs, prompt design, and practical applications"
    },
    {
      icon: Zap,
      title: "3 hours hands-on",
      description: "Build a chatbot, automate a task, or create an internal assistant"
    },
    {
      icon: Users,
      title: "Team-based learning",
      description: "Work on real business cases with your team"
    }
  ]

  const tools = [
    { name: "ChatGPT / OpenAI" },
    { name: "Claude / Anthropic" },
    { name: "Google Gemini" },
    { name: "Microsoft Copilot" },
    { name: "LangChain" },
    { name: "Chroma" },
    { name: "Supabase" },
    { name: "Zapier" }
  ]

  const deliveryOptions = [
    {
      type: "On-site",
      location: "Norway + Europe",
      icon: Users
    },
    {
      type: "Remote",
      location: "Global",
      icon: Calendar
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Calendar className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Workshops & Training</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            AI Workshops & <span className="gradient-text">Team Training</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            Teach your team how to use AI tools properly—and build real things.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {workshopStructure.map((item, index) => (
            <div 
              key={index} 
              className={`${cardBg} ${cardBorder} border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white mb-6 mx-auto">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-3`}>{item.title}</h3>
              <p className={mutedTextColor}>{item.description}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Tools Covered</h3>
            <div className="grid grid-cols-2 gap-4">
              {tools.map((tool, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-[var(--color-orange-accent)] mr-3" />
                  <span className={mutedTextColor}>{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Delivery Options</h3>
            <div className="space-y-6">
              {deliveryOptions.map((option, index) => (
                <div key={index} className={`${cardBg} ${cardBorder} border rounded-2xl p-6`}>
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)] mr-4">
                      <option.icon className="h-5 w-5" />
                    </div>
                    <h4 className={`text-lg font-semibold ${textColor}`}>{option.type}</h4>
                  </div>
                  <p className={mutedTextColor}>
                    <span className="font-medium">Available: </span>
                    {option.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 md:p-12 text-center`}>
          <div className="max-w-3xl mx-auto">
            <h3 className={`text-2xl font-bold ${textColor} mb-6`}>What's Included</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                "Templates & Guides",
                "Code Examples",
                "1-month Support",
                "Certificate of Completion"
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center">
                  <Check className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                  <span className={mutedTextColor}>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/workshop" 
                className="group relative overflow-hidden px-8 py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3">
                  <span>Join Free Workshop</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
              <Link 
                href="/contact" 
                className="group inline-flex items-center text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] font-medium"
              >
                <span>Request Custom Training</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
