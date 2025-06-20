"use client"

import React from "react"
import { Clock, Zap, Coffee, Laptop, Users, MessageSquare, Award } from "lucide-react"

interface FormatSectionProps {
  theme: "light" | "dark"
}

export const FormatSection: React.FC<FormatSectionProps> = ({ theme }) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  const schedule = [
    {
      icon: <Clock size={20} className="text-[var(--color-orange-accent)]" />,
      time: "09:00 - 09:30",
      title: "Welcome & Introduction",
      description: "Setting the stage for a day of AI exploration."
    },
    {
      icon: <Zap size={20} className="text-[var(--color-orange-accent)]" />,
      time: "09:30 - 11:00",
      title: "Session 1: The AI Landscape",
      description: "Understanding the fundamentals of AI and its impact on business."
    },
    {
      icon: <Coffee size={20} className="text-[var(--color-orange-accent)]" />,
      time: "11:00 - 11:15",
      title: "Coffee Break",
      description: "Recharge and network with fellow attendees."
    },
    {
      icon: <Laptop size={20} className="text-[var(--color-orange-accent)]" />,
      time: "11:15 - 13:00",
      title: "Session 2: Hands-on with AI Tools",
      description: "Practical session on using AI for content creation and data analysis."
    },
    {
      icon: <Users size={20} className="text-[var(--color-orange-accent)]" />,
      time: "13:00 - 14:00",
      title: "Lunch & Networking",
      description: "Enjoy a meal and discuss ideas with peers."
    },
    {
      icon: <MessageSquare size={20} className="text-[var(--color-orange-accent)]" />,
      time: "14:00 - 16:00",
      title: "Session 3: Building Your AI Project",
      description: "Group work on a real-world AI implementation project."
    },
    {
      icon: <Award size={20} className="text-[var(--color-orange-accent)]" />,
      time: "16:00 - 16:30",
      title: "Wrap-up & Q&A",
      description: "Presentations, feedback, and final questions."
    }
  ];

  return (
    <section className={`py-20 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold ${textColor}`}>Workshop Format</h2>
          <p className={mutedTextColor}>A full-day immersive experience designed for maximum learning and impact.</p>
        </div>
        <div className="max-w-4xl mx-auto bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-3">
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
            <div className="md:col-span-1 p-8 border-l border-[var(--glass-border)] bg-white/5">
                <h3 className={`text-lg font-bold ${textColor} mb-4`}>Key Information</h3>
                <ul className="space-y-3">
                  {[
                    { icon: <Clock size={16} />, text: "Full-day workshop" },
                    { icon: <Users size={16} />, text: "Small group size (max 12)" },
                    { icon: <Laptop size={16} />, text: "Hands-on and interactive" },
                    { icon: <Award size={16} />, text: "Certificate of completion" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mr-3 text-[var(--color-orange-accent)]">
                        {item.icon}
                      </div>
                      <span className={mutedTextColor}>{item.text}</span>
                    </li>
                  ))}
                </ul>
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
