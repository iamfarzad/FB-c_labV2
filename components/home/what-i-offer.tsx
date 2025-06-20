"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Bot,
  CheckCircle,
  GraduationCap,
  Zap,
  Sparkles,
  Brain,
  Rocket,
  Code,
  Shield,
  Clock,
  BarChart3,
  Cpu,
  BookOpen,
  Zap as Lightning
} from "lucide-react"
import Link from "next/link"

interface WhatIOfferProps {
  theme: "light" | "dark"
}

export const WhatIOffer: React.FC<WhatIOfferProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const [activeTab, setActiveTab] = useState(0);

  const services = [
    {
      icon: Cpu,
      title: "AI Consulting",
      tagline: "Transform your operations. Protect your data. Scale what works.",
      description: "Custom copilots, workflow automation, private models - all tailored to your business needs.",
      items: [
        { text: "Custom AI solutions for your unique business needs", icon: Brain },
        { text: "Automate repetitive tasks and workflows", icon: Rocket },
        { text: "Secure, private AI models for sensitive data", icon: Shield }
      ],
      color: "from-[#FF5B04] to-[#FF8F6A]"
    },
    {
      icon: BookOpen,
      title: "Hands-On AI Training",
      tagline: "Empower your team to use AI, not just talk about it.",
      description: "3h theory + 3h practice with tools like ChatGPT, Claude, Gemini, Copilot, and LangChain.",
      items: [
        { text: "Practical, hands-on learning experience", icon: Code },
        { text: "Immediate application to real business challenges", icon: Clock },
        { text: "Customized for your team's specific needs", icon: BarChart3 }
      ],
      color: "from-[#FF5B04] to-[#FF8F6A]"
    },
    {
      icon: Lightning,
      title: "Free Digital Workshop",
      tagline: "30 minutes, one real task automated. No slides, no fluff, just results.",
      description: "See AI in action and walk away with a working solution.",
      items: [
        { text: "No-obligation workshop", icon: CheckCircle },
        { text: "See immediate value in 30 minutes", icon: Clock },
        { text: "Walk away with a working AI solution", icon: Rocket }
      ],
      color: "from-[#FF5B04] to-[#FF8F6A]"
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-orange-accent)]/10 to-[var(--color-orange-accent)]/5 border border-[var(--color-orange-accent)]/20 mb-6 backdrop-blur-sm"
          >
            <Zap className="h-5 w-5 text-[var(--color-orange-accent)] mr-2 animate-pulse" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-wide">What I Offer</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-bold ${textColor} mb-6 leading-tight`}
          >
            AI Solutions That <span className="gradient-text">Deliver Results</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}
          >
            Real solutions that drive measurable business impact. No hype, just results you can see in your bottom line.
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {services.map((service, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === index
                  ? `text-white bg-gradient-to-r ${services[index].color} shadow-lg shadow-[var(--color-orange-accent)]/20`
                  : `${textColor} bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10`
              }`}
            >
              <div className="flex items-center space-x-2">
                {React.createElement(service.icon, {
                  className: `h-4 w-4 ${activeTab === index ? 'text-white' : 'text-[var(--color-orange-accent)]'}`
                })}
                <span>{service.title}</span>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Service Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm"
            >
              {/* Background gradient */}
              <div className={`absolute -right-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-br ${services[activeTab].color} opacity-10 blur-3xl -z-10`}></div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${services[activeTab].color} text-white mb-6 shadow-lg`}>
                    {React.createElement(services[activeTab].icon, {
                      className: "h-8 w-8",
                      strokeWidth: 1.5
                    })}
                  </div>

                  <h3 className={`text-3xl font-bold ${textColor} mb-4`}>
                    {services[activeTab].title}
                  </h3>

                  <p className={`text-xl font-medium ${textColor} mb-6`}>
                    {services[activeTab].tagline}
                  </p>

                  <p className={`${mutedTextColor} mb-8 leading-relaxed`}>
                    {services[activeTab].description}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {services[activeTab].items.map((item, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start group"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <div className={`flex-shrink-0 mt-1 mr-4 p-1.5 rounded-lg bg-gradient-to-br ${services[activeTab].color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                          <item.icon className="h-5 w-5" style={{ color: services[activeTab].color.split(' ')[0].replace('from-', '') }} />
                        </div>
                        <span className={mutedTextColor}>{item.text}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/consulting"
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-white bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/20 transition-all duration-300 group"
                    >
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
                <div className="hidden md:block">
                  <div className="relative h-full">
                    {/* Terminal window */}
                    <div className={`relative h-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg`}>
                      {/* Terminal header */}
                      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                        <div className="flex space-x-2 mr-4">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          terminal ~ {services[activeTab].title.toLowerCase().replace(/\s+/g, '-')}
                        </div>
                      </div>

                      {/* Terminal content */}
                      <div className="p-4 h-full font-mono text-sm">
                        <div className="text-green-500 dark:text-green-400 mb-4">
                          $ <span className="text-gray-800 dark:text-gray-200">analyze --service {services[activeTab].title.toLowerCase()}</span>
                        </div>

                        <div className="text-cyan-600 dark:text-cyan-400 mb-4">
                          <div className="flex items-start">
                            <span className="text-gray-500 dark:text-gray-400 mr-2">{'>'}</span>
                            <span>Analyzing business impact...</span>
                          </div>
                          <div className="flex items-start mt-1">
                            <span className="text-gray-500 dark:text-gray-400 mr-2">{'>'}</span>
                            <span>Found {services[activeTab].items.length} key benefits</span>
                          </div>
                        </div>

                        <div className="space-y-3 mt-6">
                          {services[activeTab].items.map((item, i) => (
                            <div key={i} className="flex items-start">
                              <span className="text-green-500 dark:text-green-400 mr-2">✓</span>
                              <span className="text-gray-800 dark:text-gray-200">{item.text}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-purple-500 dark:text-purple-400">
                            $ <span className="text-gray-800 dark:text-gray-200">business_impact --calculate</span>
                          </div>
                          <div className="text-gray-800 dark:text-gray-200 mt-2">
                            Estimated impact: <span className="font-bold text-[var(--color-orange-accent)]">+{Math.floor(Math.random() * 30) + 20}%</span> efficiency
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle gradient overlay */}
                    <div className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-gradient-to-br ${services[activeTab].color} opacity-5 dark:opacity-10 blur-3xl -z-10`}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
