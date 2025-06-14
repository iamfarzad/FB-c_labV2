"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { ContainerScroll, CardSticky } from "@/components/ui/cards-stack"

interface ProcessCardsProps {
  theme?: "light" | "dark"
  className?: string
}

const PROCESS_STEPS = [
  {
    id: "process-1",
    icon: "🔍",
    title: "Discovery & Analysis",
    description: "We dive deep into your business challenges and objectives through collaborative workshops and stakeholder interviews to identify the perfect AI solutions.",
    benefits: [
      "Comprehensive needs assessment",
      "Competitive analysis",
      "ROI projection"
    ],
    color: "from-[#7C3AED] to-[#8B5CF6]"
  },
  {
    id: "process-2",
    icon: "🎨",
    title: "Solution Design",
    description: "Our experts craft a tailored solution architecture with detailed technical specifications, user flows, and interactive prototypes.",
    benefits: [
      "Custom architecture design",
      "Technology stack selection",
      "Interactive prototypes"
    ],
    color: "from-[#F59E0B] to-[#FBBF24]"
  },
  {
    id: "process-3",
    icon: "⚙️",
    title: "Development & Integration",
    description: "We build your solution using agile methodologies, with regular demos and seamless integration into your existing systems.",
    benefits: [
      "Agile development sprints",
      "Bi-weekly progress demos",
      "Seamless system integration"
    ],
    color: "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)]"
  },
  {
    id: "process-4",
    icon: "🧪",
    title: "Testing & Optimization",
    description: "Rigorous testing ensures your solution meets the highest standards of quality, performance, and user experience.",
    benefits: [
      "Automated testing",
      "Performance optimization",
      "User acceptance testing"
    ],
    color: "from-[#10B981] to-[#34D399]"
  },
  {
    id: "process-5",
    icon: "🚀",
    title: "Deployment & Support",
    description: "We handle the entire deployment process and provide ongoing support to ensure your continued success.",
    benefits: [
      "Smooth deployment",
      "Training & documentation",
      "24/7 support"
    ],
    color: "from-[#8B5CF6] to-[#A78BFA]"
  }
]

export function ProcessCards({ 
  theme = "light", 
  className = "" 
}: ProcessCardsProps) {
  const textColor = theme === "dark" ? "text-white" : "text-gray-900"
  const mutedTextColor = theme === "dark" ? "text-gray-300" : "text-gray-600"
  const cardBg = theme === "dark" ? "bg-gray-800/50" : "bg-white/80"

  return (
    <section 
      id="our-process"
      className={cn("relative py-16 md:py-24 lg:py-32 overflow-hidden", className, {
        'bg-gradient-to-b from-gray-50 to-white': theme === 'light',
        'bg-gradient-to-b from-gray-900 to-gray-800': theme === 'dark'
      })}
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            How We Work
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${theme === 'dark' ? 'from-indigo-300 to-purple-300' : 'from-indigo-600 to-purple-600'}`}>
            Our Process
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${mutedTextColor}`}>
            A transparent, collaborative approach to delivering AI solutions that drive real business impact
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 w-1 h-full -ml-px bg-gradient-to-b from-indigo-400/20 to-transparent dark:from-indigo-500/20"></div>
          
          <div className="space-y-16 md:space-y-24">
            {PROCESS_STEPS.map((step, index) => (
              <div key={step.id} className="relative group">
                <div className={`absolute left-1/2 -ml-2.5 w-5 h-5 rounded-full border-4 ${theme === 'dark' ? 'border-indigo-500 bg-gray-900' : 'border-indigo-400 bg-white'} z-10`}></div>
                
                <div className={`ml-12 md:ml-20 p-8 rounded-2xl ${cardBg} backdrop-blur-sm border ${theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'} shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1`}>
                  <div className="flex flex-col md:flex-row md:items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl text-3xl ${theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-50'}`}>
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <h3 className={`text-2xl font-bold ${textColor}`}>
                          {step.title}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                          Step {index + 1}
                        </span>
                      </div>
                      
                      <p className={`${mutedTextColor} text-lg mb-6`}>
                        {step.description}
                      </p>
                      
                      {step.benefits && step.benefits.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            Key Benefits:
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {step.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start">
                                <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className={mutedTextColor}>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
