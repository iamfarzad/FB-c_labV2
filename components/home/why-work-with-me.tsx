"use client"

import React, { useMemo } from "react"
import { ArrowRight, CheckCircle, Sparkles, Award } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { SectionLayout } from "@/components/layouts/section-layout"
import { HTMLMotionProps } from "framer-motion"

interface SectionItem {
  id: string
  title: string
  scrollOffset?: number
}

interface ReasonItem {
  title: string
  description: string
  icon: React.ReactNode
  id: string
}

interface WhyWorkWithMeProps {
  theme: "light" | "dark"
}

const SECTIONS: SectionItem[] = [
  { 
    id: 'why-work-with-me', 
    title: 'Why Work With Me', 
    scrollOffset: 0 
  }
]

const REASONS: Omit<ReasonItem, 'id'>[] = [
  {
    title: "10,000+ Hours",
    description: "Building cutting-edge AI solutions since 2020",
    icon: <Sparkles className="h-6 w-6" aria-hidden="true" />
  },
  {
    title: "Results First",
    description: "Delivering real business impact, not just code",
    icon: <Award className="h-6 w-6" aria-hidden="true" />
  },
  {
    title: "Industry Veteran",
    description: "Proven track record across multiple sectors",
    icon: <CheckCircle className="h-6 w-6" aria-hidden="true" />
  },
  {
    title: "Client Focused",
    description: "Your success is my top priority",
    icon: <CheckCircle className="h-6 w-6" aria-hidden="true" />
  }
]

export const WhyWorkWithMe: React.FC<WhyWorkWithMeProps> = ({ theme }) => {
  // Memoize derived values
  const { textColor, mutedTextColor, borderColor, cardBg, hoverBg } = useMemo(() => ({
    textColor: theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]",
    mutedTextColor: theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/80",
    borderColor: theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200",
    cardBg: theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white",
    hoverBg: theme === "dark" ? "hover:bg-[var(--glass-hover)]" : "hover:bg-gray-50"
  }), [theme])

  // Add unique IDs to reasons for better accessibility
  const reasons = useMemo(() => 
    REASONS.map((reason, index) => ({
      ...reason,
      id: `reason-${index}`
    })),
    []
  )

  return (
    <SectionLayout 
      sections={SECTIONS}
      sideTextPosition="left"
      className={`relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-[var(--color-gunmetal)]' 
          : 'bg-gradient-to-b from-[var(--color-light-silver)] to-white'
      }`}
      aria-label="Why work with me section"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,91,4,0.1),transparent_70%)]">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgydi00aDRWNGgtNHptLTMwIDMwdjRoLTJ2NGgtNHYyaDR2NGgydjRoMnYtNGg0di0yaC00em0wLTMwVjBIMnY0SDB2Mmg0djRoMnYtNGg0VjRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-gunmetal)] opacity-90" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[var(--color-light-silver)]/30 to-white" />
        )}
      </div>

      <section 
        id="why-work-with-me" 
        className={`relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-white' : 'text-[var(--color-gunmetal)]'}`}
        aria-labelledby="why-work-with-me-heading"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <span className={`inline-block px-4 py-2 text-sm font-mono rounded-full mb-6 tracking-wider ${theme === 'dark' 
                ? 'bg-gradient-to-r from-[var(--color-orange-accent)] to-[#ff8c42] text-white' 
                : 'bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)]'}`}>
                WHY CHOOSE ME
              </span>
            </motion.div>
            
            <motion.h2 
              id="why-work-with-me-heading"
              className={`text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className={theme === 'dark' 
                ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300' 
                : 'text-[var(--color-gunmetal)]'}>
                AI That
              </span>
              <br />
              <span className={`bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-orange-accent)] to-[#ff8c42] ${theme === 'dark' ? 'animate-gradient' : ''}`}>
                Delivers Results
              </span>
            </motion.h2>
            
            <motion.p 
              className={`text-lg md:text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-[var(--color-gunmetal)]/80'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transforming businesses with cutting-edge AI solutions that drive real impact and measurable growth.
            </motion.p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ y: -8 }}
                className={`group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 ${cardBg} ${borderColor} border ${hoverBg} 
                  ${theme === 'dark' ? 'shadow-lg' : 'shadow-md'}`}
              >
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-[var(--color-orange-accent)]/10 to-transparent' 
                    : 'bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent'}`} 
                />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-[var(--color-orange-accent)] to-[#ff8c42] text-white' 
                      : 'bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)]'}`}>
                    {React.cloneElement(reason.icon as React.ReactElement, {
                      className: 'h-5 w-5'
                    })}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[var(--color-gunmetal)]'}`}>
                    {reason.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-[var(--color-gunmetal)]/80'}`}>
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-[var(--color-gunmetal)]/80'}`}>
              Ready to transform your business with AI?
            </p>
            <Link
              href="/about"
              className={`inline-flex items-center px-8 py-4 rounded-full font-medium transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-[var(--color-orange-accent)] to-[#ff8c42] text-white hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/20'
                  : 'bg-[var(--color-orange-accent)] text-white hover:shadow-lg hover:shadow-[var(--color-orange-accent)]/30'
              }`}
            >
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SectionLayout>
  )
}
