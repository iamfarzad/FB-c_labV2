"use client"

import React, { useRef } from "react"
import { motion, useInView, Variants } from "framer-motion"
import { ArrowUpRight, Zap, BarChart, TrendingUp, Clock } from "lucide-react"
import DisplayCards from "@/components/ui/display-cards"

interface ResultsProps {
  theme: "light" | "dark"
}

export const Results: React.FC<ResultsProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const results = [
    {
      icon: BarChart,
      title: "65% Faster",
      description: "Response time dropped with custom chatbot implementation"
    },
    {
      icon: Clock,
      title: "3 Days → 30 Min",
      description: "Financial reports that took 3 days now complete in 30 minutes"
    },
    {
      icon: TrendingUp,
      title: "40% More",
      description: "Increase in conversion rates after implementing AI insights"
    }
  ]

  const displayCards = results.map(result => ({
    icon: React.createElement(result.icon, { className: "size-5" }),
    title: result.title,
    description: result.description,
    date: "Real Results"
  }))

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-orange-accent)]/10 text-[var(--color-orange-accent)] mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Success Metrics
          </div>
          <h2 className={`text-4xl sm:text-5xl font-bold ${textColor} mb-6`}>
            Real <span className="gradient-text">Business Impact</span>
          </h2>
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            See how businesses are transforming their operations with practical AI solutions.
          </p>
        </motion.div>

        <motion.div
          className="w-full mb-16"
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          <DisplayCards cards={displayCards} />
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className={`${mutedTextColor} mb-8 max-w-3xl mx-auto text-lg`}>
            These are just a few examples of how AI can transform your business. Every organization is different, and I work with you to identify the highest-impact opportunities.
          </p>
          <motion.a
            href="/contact"
            className="relative inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold overflow-hidden group"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 25px -5px rgba(247, 144, 9, 0.2)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">Get Your Free Consultation</span>
            <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 z-10" />

            {/* Animated background elements */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] opacity-100 group-hover:opacity-0 transition-opacity duration-300"
              initial={{ opacity: 1 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
            />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}