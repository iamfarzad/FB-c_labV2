"use client"

import React from "react"
import { motion } from "framer-motion"
import { Lightbulb, Zap, Code, Target } from "lucide-react"

interface WhySectionProps {
  theme: "light" | "dark"
}

export const WhySection: React.FC<WhySectionProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.16, 0.77, 0.47, 0.97] 
      } 
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  }

  const reasons = [
    {
      icon: <Lightbulb className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Transformative Impact",
      description: "I believe AI can transform businesses and improve lives—but only when it's implemented thoughtfully and ethically."
    },
    {
      icon: <Zap className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Practical Solutions",
      description: "My focus is on delivering real, practical solutions that solve actual business problems, not just implementing technology for technology's sake."
    },
    {
      icon: <Code className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Continuous Innovation",
      description: "The AI field evolves rapidly, and I'm committed to staying at the forefront of new developments and technologies."
    },
    {
      icon: <Target className="h-6 w-6 text-[var(--color-orange-accent)]" />,
      title: "Mission-Driven Work",
      description: "I'm driven by the potential of AI to create meaningful, lasting value for businesses and society as a whole."
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden" id="why">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent" />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8,
              ease: [0.16, 0.77, 0.47, 0.97] 
            } 
          }}
          viewport={{ once: true, margin: "-20%" }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
            <Lightbulb className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">My Mission</span>
          </div>
          
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${textColor} mb-6 max-w-4xl mx-auto leading-tight`}>
            Why I Do <span className="gradient-text">This Work</span>
          </h2>
          
          <p className={`text-xl ${mutedTextColor} max-w-3xl mx-auto`}>
            I believe in the power of AI to create meaningful change when applied with purpose and responsibility.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className={`${cardBg} ${cardBorder} border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:border-[var(--color-orange-accent)]/30`}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-accent)]/10 flex items-center justify-center mb-4">
                {reason.icon}
              </div>
              <h3 className={`text-xl font-bold ${textColor} mb-3`}>{reason.title}</h3>
              <p className={mutedTextColor}>{reason.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8,
              delay: 0.6,
              ease: [0.16, 0.77, 0.47, 0.97] 
            } 
          }}
          viewport={{ once: true, margin: "-20%" }}
        >
          <p className={`text-lg ${mutedTextColor} max-w-3xl mx-auto mb-8`}>
            When I'm not working with clients, you'll find me exploring new AI technologies, contributing to open-source projects, or sharing my knowledge through workshops and talks.
          </p>
          <button className="inline-flex items-center text-[var(--color-orange-accent)] hover:underline text-lg font-medium">
            Learn more about my approach
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-5 w-5">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
