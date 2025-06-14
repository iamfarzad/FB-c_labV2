"use client"

import React from "react"
import { Clock, Zap, Coffee, Laptop, Users, MessageSquare, Award } from "lucide-react"

interface FormatSectionProps {
  theme: "light" | "dark"
}

export const FormatSection: React.FC<FormatSectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const schedule = [
    {
      time: "09:30 - 10:00",
      title: "Registration & Coffee",
      icon: <Coffee className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Arrive, get settled, and enjoy some refreshments"
    },
    {
      time: "10:00 - 11:30",
      title: "Introduction to AI for Business",
      icon: <Zap className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Understanding AI capabilities and business applications"
    },
    {
      time: "11:30 - 11:45",
      title: "Networking Break",
      icon: <Users className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Connect with fellow participants"
    },
    {
      time: "11:45 - 13:00",
      title: "Hands-on Session 1",
      icon: <Laptop className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Practical exercises with AI tools"
    },
    {
      time: "13:00 - 14:00",
      title: "Lunch Break",
      icon: <Coffee className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Networking and informal discussions"
    },
    {
      time: "14:00 - 15:30",
      title: "Hands-on Session 2",
      icon: <Laptop className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Building your first AI solution"
    },
    {
      time: "15:30 - 15:45",
      title: "Afternoon Break",
      icon: <Coffee className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Refreshments and networking"
    },
    {
      time: "15:45 - 17:00",
      title: "Q&A & Next Steps",
      icon: <MessageSquare className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Get your questions answered and plan your AI journey"
    },
    {
      time: "17:00",
      title: "Workshop Concludes",
      icon: <Award className="h-5 w-5 text-[var(--color-orange-accent)]" />,
      description: "Certificate distribution and farewell"
    }
  ]

  return (
    <section className="py-20 relative bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Clock className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Workshop Format</span>
          </div>
          <h2 className={`text-3xl sm:text-4xl font-bold ${textColor} mb-6`}>
            Workshop <span className="gradient-text">Schedule</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            A well-structured day designed for maximum learning and interaction.
          </p>
        </div>

        <div className={`${cardBg} ${cardBorder} border rounded-2xl overflow-hidden`}>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
            {/* Timeline */}
            <div className="p-8">
              <h3 className={`text-xl font-bold ${textColor} mb-6 flex items-center`}>
                <Clock className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
                Agenda
              </h3>
              <div className="space-y-1">
                {schedule.map((item, index) => (
                  <div key={index} className="pb-4 mb-4 border-b border-[var(--glass-border)] last:border-0 last:mb-0 last:pb-0">
                    <div className="text-sm font-medium text-[var(--color-orange-accent)]">{item.time}</div>
                    <div className="font-medium">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Detailed Schedule */}
            <div className="md:col-span-2 p-8">
              <h3 className={`text-xl font-bold ${textColor} mb-6`}>Detailed Breakdown</h3>
              <div className="space-y-8">
                {schedule.map((item, index) => (
                  <div key={index} className="flex group">
                    <div className="flex-shrink-0 mr-4 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-orange-accent)]/10 flex items-center justify-center group-hover:bg-[var(--color-orange-accent)]/20 transition-colors">
                        {item.icon}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-orange-accent)]">{item.time}</div>
                      <h4 className={`text-lg font-bold ${textColor} mb-1`}>{item.title}</h4>
                      <p className={mutedTextColor}>{item.description}</p>
                      
                      {/* Additional details for main sessions */}
                      {index === 1 && (
                        <div className="mt-3 pl-4 border-l-2 border-[var(--color-orange-accent)]/20">
                          <p className="text-sm font-medium mb-2">Topics covered:</p>
                          <ul className="text-sm space-y-1">
                            {[
                              "AI fundamentals and terminology",
                              "Real-world business use cases",
                              "Understanding AI limitations and ethics",
                              "Getting started with AI tools"
                            ].map((topic, i) => (
                              <li key={i} className="flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mt-1.5 mr-2 flex-shrink-0" />
                                <span className={mutedTextColor}>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {index === 3 && (
                        <div className="mt-3 pl-4 border-l-2 border-[var(--color-orange-accent)]/20">
                          <p className="text-sm font-medium mb-2">You'll learn to:</p>
                          <ul className="text-sm space-y-1">
                            {[
                              "Set up and use AI tools",
                              "Create effective AI prompts",
                              "Automate repetitive tasks",
                              "Analyze data with AI"
                            ].map((item, i) => (
                              <li key={i} className="flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mt-1.5 mr-2 flex-shrink-0" />
                                <span className={mutedTextColor}>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {index === 5 && (
                        <div className="mt-3 pl-4 border-l-2 border-[var(--color-orange-accent)]/20">
                          <p className="text-sm font-medium mb-2">You'll build:</p>
                          <ul className="text-sm space-y-1">
                            {[
                              "A custom AI assistant",
                              "Automated workflows",
                              "Data analysis dashboards",
                              "Implementation plan for your business"
                            ].map((item, i) => (
                              <li key={i} className="flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)] mt-1.5 mr-2 flex-shrink-0" />
                                <span className={mutedTextColor}>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-8 border-t border-[var(--glass-border)] bg-gradient-to-r from-[var(--color-orange-accent)]/5 to-transparent">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-4`}>Learning Outcomes</h3>
                <ul className="space-y-3">
                  {[
                    "Understand AI capabilities and limitations",
                    "Learn to use key AI tools and platforms",
                    "Develop practical AI solutions for your business",
                    "Create an AI implementation roadmap"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                      </div>
                      <span className={mutedTextColor}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${textColor} mb-4`}>What's Included</h3>
                <ul className="space-y-3">
                  {[
                    "Comprehensive workshop materials",
                    "Access to all tools and resources",
                    "Certificate of completion",
                    "30-day support access"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-orange-accent)]/10 flex items-center justify-center mt-0.5 mr-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange-accent)]" />
                      </div>
                      <span className={mutedTextColor}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
