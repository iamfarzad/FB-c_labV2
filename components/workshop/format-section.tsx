// FormatSection component has been temporarily removed as per user request
// To restore, uncomment the component code below and ensure all imports are properly configured

/*
"use client"

import React from "react"
import { Clock, Zap, Coffee, Laptop, Users, MessageSquare, Award } from "lucide-react"

interface FormatSectionProps {
  theme: "light" | "dark"
}

export const FormatSection: React.FC<FormatSectionProps> = ({ theme }) => {
  // Component implementation here
  return null
}
*/

// Export an empty object to satisfy TypeScript
export {}
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
