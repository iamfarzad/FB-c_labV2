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
  FileText,
  Mic,
  Zap as Lightning,
  MessageSquare,
  PlayCircle
} from "lucide-react"
import Link from "next/link"
import { ThreeDHoverCard } from "@/components/ui/3d-hover-card"

interface AIBuildSectionProps {
  theme: "light" | "dark"
}

export const AIBuildSection: React.FC<AIBuildSectionProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState(0);
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"
  const actionTextColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  
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
      color: "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-dark)]"
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
      color: "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-dark)]"
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
      color: "from-[var(--color-orange-accent)] to-[var(--color-orange-accent-dark)]"
    },
    {
      icon: MessageSquare,
      title: "See It In Action",
      tagline: "I Don't Just Talk About AI — I Build It",
      description: "This entire website runs on AI systems I developed myself. Try my assistant now and experience the same technology I can implement for your business.",
      items: [
        { text: "Real-time business intelligence", icon: CheckCircle },
        { text: "Document analysis & insights", icon: FileText },
        { text: "Voice interaction with my cloned voice", icon: Mic }
      ],
      color: "from-[#3B82F6] to-[#60A5FA]"
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
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-wide">AI Solutions</span>
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
            className={`text-xl ${mutedTextColor} max-w-3xl mx-auto mb-8`}
          >
            Real solutions that drive measurable business impact. No hype, just results you can see in your bottom line.
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`text-2xl font-medium ${textColor} max-w-4xl mx-auto mb-8`}
          >
            I Don't Just Talk About AI — <span className="text-[var(--color-orange-accent)]">I Build It</span>
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`text-lg ${mutedTextColor} max-w-3xl mx-auto mb-8`}
          >
            This entire website runs on AI systems I developed myself. Try my assistant now and experience the same technology I can implement for your business.
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {services.map((service, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === index
                  ? `text-white bg-[var(--gradient-orange)] shadow-lg shadow-[var(--color-orange-accent)]/20`
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
              className={`bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-sm ${activeTab === 3 ? 'min-h-[500px]' : ''}`}
            >
              {/* Background gradient */}
              <div className={`absolute -right-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-br ${services[activeTab].color} opacity-10 blur-3xl -z-10`}></div>
              
              {activeTab === 3 ? (
                // Special layout for "See It In Action" tab
                <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-6">
                      F.B/c AI in Action
                    </h3>
                    <p className={`${mutedTextColor} mb-8 text-lg`}>
                      Experience the power of custom AI with a live demo of the same technology that powers this website.
                    </p>
                    <ul className="space-y-4 mb-8">
                      {services[3].items.map((item, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-start group"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <div className="flex-shrink-0 mt-1 mr-4 p-1.5 rounded-lg bg-gradient-to-br from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] bg-opacity-10 group-hover:bg-opacity-20 transition-all">
                            <item.icon className="h-5 w-5 text-[var(--color-orange-accent)]" />
                          </div>
                          <span className={actionTextColor} style={{ color: 'var(--color-light-silver)' }}>{item.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.98 }}
                      className="inline-block"
                    >
                      <button className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-white bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/20 transition-all duration-300 group">
                        Try AI Assistant Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </motion.div>
                  </div>
                  <div className="relative h-full min-h-[500px] w-full">
                    <ThreeDHoverCard 
                      title="Interactive AI Demo"
                      description="Experience the power of our AI technology in real-time. Hover over the card to see it in action!"
                      className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900"
                    />
                  </div>
                </div>
              ) : (
                // Original service content layout
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
                  
                  {/* Right side image/illustration */}
                  <div className="hidden md:block">
                    <div className="relative h-full min-h-[400px] w-full">
                      <ThreeDHoverCard 
                        title={services[activeTab].title}
                        description={services[activeTab].tagline}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
