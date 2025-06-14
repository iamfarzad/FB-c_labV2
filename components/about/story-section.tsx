"use client"

import React from "react"
import { motion } from "framer-motion"
import { BookOpen, Code, GraduationCap, Briefcase, Rocket } from "lucide-react"
import { TimelineEntry } from "@/components/ui/timeline"
import { TimelineStack } from "@/components/ui/timeline-stack"

interface StorySectionProps {
  theme: "light" | "dark"
}

const timelineData: TimelineEntry[] = [
  {
    year: "2020",
    title: "AI Journey Begins",
    description: "Began self-learning AI & automation, built Optix.io",
    details: "Started the journey into AI and automation, building Optix.io as a platform to explore and implement AI solutions.",
    icon: Code,
    color: "var(--color-orange-accent)"
  },
  {
    year: "2021",
    title: "iWriter.ai Launch",
    description: "Launched iWriter.ai for Norwegian SMEs",
    details: "Developed and launched iWriter.ai, an AI-powered writing assistant specifically designed to help Norwegian small and medium-sized businesses with their content creation needs.",
    icon: BookOpen,
    color: "var(--color-blue-accent)"
  },
  {
    year: "2022",
    title: "Talk to Eve",
    description: "Developed 'Talk to Eve' for workplace mental wellness",
    details: "Created an AI-powered mental wellness application designed to support employees' mental health in the workplace, focusing on accessible and confidential support.",
    icon: GraduationCap,
    color: "var(--color-orange-accent)"
  },
  {
    year: "2023",
    title: "ZingZang Lab",
    description: "Built ZingZang Lab (AI music app), expanded consulting",
    details: "Developed ZingZang Lab, an innovative AI music application, while also growing the AI consulting practice to help more businesses implement AI solutions.",
    icon: Briefcase,
    color: "var(--color-blue-accent)"
  },
  {
    year: "2024",
    title: "AI Workshops & Consulting",
    description: "Ran hands-on AI workshops, launched F.B Consulting",
    details: "Conducted practical AI workshops and officially launched F.B Consulting to provide expert AI implementation services to businesses of all sizes.",
    icon: Rocket,
    color: "var(--color-orange-accent)"
  },
  {
    year: "2025",
    title: "AI-Powered Assistant",
    description: "Released AI-powered website assistant (this site)",
    details: "Launched an advanced AI assistant integrated into this website to demonstrate practical AI applications and provide interactive experiences for visitors.",
    icon: Rocket,
    color: "var(--color-blue-accent)"
  }
]

export function StorySection({ theme }: StorySectionProps) {
  const textColor = theme === 'dark' ? 'text-[var(--color-light-silver)]' : 'text-[var(--color-gunmetal)]';
  const mutedTextColor = theme === 'dark' ? 'text-[var(--color-light-silver)]/80' : 'text-[var(--color-gunmetal)]/80';
  const borderColor = theme === 'dark' ? 'border-[var(--glass-border)]' : 'border-gray-200';

  return (
    <section id="my-journey" className="py-16 md:py-24 relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-orange-accent)]/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-4">
            <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">Timeline</span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColor}`}>
            My Journey So Far
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${mutedTextColor}`}>
            From early experiments to meaningful solutions - my journey in tech and AI.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left column - Text content */}
          <motion.div 
            className="sticky top-24"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 0.6,
                ease: [0.16, 0.77, 0.47, 0.97]
              } 
            }}
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[var(--glass-bg)]' : 'bg-white'} border ${borderColor} shadow-sm`}>
              <p className={`text-base mb-4 ${mutedTextColor}`}>
                In 2020, I launched my first startup, Optix.io, and dove into the world of technology and AI with no formal tech background. The journey was full of challenges, but each obstacle became a learning opportunity.
              </p>
              <p className={`text-base ${mutedTextColor}`}>
                Today, I combine storytelling expertise with technical skills to build AI solutions that are both powerful and meaningful. My background in global media gives me a unique perspective on how AI can enhance human creativity and productivity.
              </p>
            </div>
          </motion.div>

          {/* Right column - Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.6,
                ease: [0.16, 0.77, 0.47, 0.97]
              } 
            }}
            viewport={{ once: true, margin: "-10%" }}
            className="h-[600px] overflow-y-auto"
          >
            <TimelineStack items={timelineData} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
