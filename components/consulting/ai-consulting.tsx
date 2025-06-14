"use client"

import React from "react"
import { ArrowRight, Bot, Cpu, Zap, Check } from "lucide-react"
import Link from "next/link"

interface AIConsultingProps {
  theme: "light" | "dark"
}

export const AIConsulting: React.FC<AIConsultingProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const services = [
    "Build internal chatbots connected to company data",
    "Automate customer service, HR, and operations tasks",
    "Design and deploy private/local AI copilots",
    "Build lightweight MVPs and test automation ideas quickly",
    "Debug, audit, or scale broken AI systems"
  ]

  const idealFor = [
    "Startups, SMEs, or enterprise teams",
    "Ops, support, marketing, HR, product teams",
    "Leaders who want to automate repetitive tasks",
    "Teams needing custom AI solutions"
  ]

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
              <Bot className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
              <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">AI Consulting</span>
            </div>
            
            <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
              Hands-on help for companies that want to use AI to <span className="gradient-text">cut costs, save time, and improve accuracy</span>.
            </h2>
            
            <p className={`text-lg ${mutedTextColor} mb-8`}>
              I work directly with your team to implement AI solutions that solve real business problems, not just technical demos.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className={`font-semibold ${textColor} mb-3 text-lg`}>What I help with:</h3>
                <ul className="space-y-3">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-[var(--color-orange-accent)] flex-shrink-0 mt-1 mr-3" />
                      <span className={mutedTextColor}>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className={`font-semibold ${textColor} mb-3 text-lg`}>Good for:</h3>
                <div className="flex flex-wrap gap-2">
                  {idealFor.map((item, index) => (
                    <span key={index} className={`${cardBg} ${cardBorder} border rounded-full px-4 py-2 text-sm ${mutedTextColor}`}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/contact" 
                className="group inline-flex items-center text-[var(--color-orange-accent)] hover:text-[var(--color-orange-accent-light)] font-medium text-lg"
              >
                <span>Request a Custom Quote</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          <div className={`${cardBg} ${cardBorder} border rounded-2xl p-8 h-full`}>
            <div className="bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-[var(--color-orange-accent)]/10 rounded-2xl p-8 h-full flex flex-col">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white mb-8">
                <Cpu className="h-7 w-7" />
              </div>
              
              <h3 className={`text-2xl font-bold ${textColor} mb-4`}>How It Works</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-orange-accent)] text-white text-sm font-semibold mr-4 mt-0.5">1</div>
                  <div>
                    <h4 className={`font-semibold ${textColor}`}>Discovery Call</h4>
                    <p className={mutedTextColor}>We'll discuss your goals and challenges</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-orange-accent)] text-white text-sm font-semibold mr-4 mt-0.5">2</div>
                  <div>
                    <h4 className={`font-semibold ${textColor}`}>Custom Proposal</h4>
                    <p className={mutedTextColor}>I'll create a tailored plan with clear deliverables</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-orange-accent)] text-white text-sm font-semibold mr-4 mt-0.5">3</div>
                  <div>
                    <h4 className={`font-semibold ${textColor}`}>Implementation</h4>
                    <p className={mutedTextColor}>We'll build and deploy your AI solution</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 border-t border-[var(--glass-border)]">
                <p className={`text-sm ${mutedTextColor} mb-4`}>
                  <Zap className="inline-block h-4 w-4 text-[var(--color-orange-accent)] mr-1" />
                  Most projects start seeing results within 2-4 weeks
                </p>
                <Link 
                  href="/contact" 
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-none text-white bg-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent-light)] transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
