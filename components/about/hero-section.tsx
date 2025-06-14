"use client"

import React, { useRef, useEffect } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { WarpBackground } from "@/components/magicui/warp-background"

interface AboutHeroProps {
  theme: "light" | "dark"
}

export const AboutHero: React.FC<AboutHeroProps> = ({ theme }) => {
  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/90"
  const cardBg = theme === "dark" ? "bg-[var(--glass-bg)]" : "bg-white"
  const cardBorder = theme === "dark" ? "border-[var(--glass-border)]" : "border-gray-200"

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden pt-0 pb-16 md:pb-24">
      {/* Warp Background */}
      <WarpBackground 
        perspective={1000}
        beamsPerSide={5}
        beamSize={5}
        beamDelayMax={3}
        beamDelayMin={0}
        beamDuration={3}
        gridColor={theme === 'dark' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
        className="absolute inset-0 z-0 pointer-events-none opacity-70"
      >
        <div className="absolute inset-0" />
      </WarpBackground>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-orange-accent)]/5 to-transparent" />
      </div>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Profile Image on the left */}
          <motion.div 
            className="relative order-2 lg:order-1 w-full max-w-md mx-auto lg:max-w-none"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ 
              opacity: 1, 
              x: 0,
              transition: { 
                duration: 0.8,
                ease: [0.16, 0.77, 0.47, 0.97] 
              } 
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-[var(--color-orange-accent)]/20 to-[var(--color-orange-accent-light)]/20 p-1">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <motion.div 
                  className="w-full h-full"
                  initial={{ scale: 1.1, opacity: 0 }}
                  whileInView={{ 
                    scale: 1,
                    opacity: 1,
                    transition: { 
                      duration: 0.8,
                      delay: 0.2,
                      ease: [0.16, 0.77, 0.47, 0.97] 
                    } 
                  }}
                  viewport={{ once: true, margin: "-20%" }}
                >
                  <img 
                    src="/farzad-bayat-profile.jpg" 
                    alt="Farzad Bayat"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </motion.div>
                
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-[var(--color-orange-accent)]/20 backdrop-blur-sm" />
                <div className="absolute bottom-6 left-6 w-24 h-24 rounded-full bg-[var(--color-orange-accent-light)]/20 backdrop-blur-sm" />
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[var(--color-orange-accent)]/10 rounded-2xl -z-10 hidden md:block" />
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-[var(--color-orange-accent-light)]/10 rounded-full -z-10 hidden md:block" />
          </motion.div>
          
          {/* Text content on the right */}
          <motion.div 
            className="relative order-1 lg:order-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 0.77, 0.47, 0.97] 
              } 
            }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-none bg-[var(--color-orange-accent)]/10 border border-[var(--color-orange-accent)]/30 mb-6">
              <Sparkles className="h-5 w-5 text-[var(--color-orange-accent)] mr-2" />
              <span className="text-sm font-tech-mono text-[var(--color-orange-accent)] uppercase tracking-tech-wide">About Me</span>
            </div>
            
            <h1 className={`text-4xl sm:text-5xl xl:text-6xl font-bold ${textColor} mb-6 leading-tight sm:leading-tight`}>
              Self-Taught. Results-Focused. <span className="gradient-text">AI That Actually Works.</span>
            </h1>
            
            <div className="space-y-4 mb-8">
              <p className={`text-xl sm:text-2xl ${mutedTextColor} leading-relaxed`}>
                I'm Farzad Bayat—AI consultant, builder, and systems thinker. I don't just talk about AI. I build, test, and deliver it.
              </p>
              
              <p className={`text-lg ${mutedTextColor} italic`}>
                A self-taught AI consultant who spent 10,000+ hours figuring out what works—so your business doesn't have to.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.6,
                    delay: 0.3,
                    ease: [0.16, 0.77, 0.47, 0.97] 
                  } 
                }}
                viewport={{ once: true, margin: "-20%" }}
              >
                <Link 
                  href="/contact" 
                  className="group relative overflow-hidden px-6 sm:px-8 py-3 sm:py-4 rounded-none bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] text-white font-semibold text-base sm:text-lg shadow-2xl hover:shadow-[var(--color-orange-accent)]/25 transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange-accent-light)] to-[var(--color-orange-accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-2 sm:space-x-3">
                    <span>Let's Work Together</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.6,
                    delay: 0.4,
                    ease: [0.16, 0.77, 0.47, 0.97] 
                  } 
                }}
                viewport={{ once: true, margin: "-20%" }}
              >
                <Link 
                  href="/consulting" 
                  className={`group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-none border ${cardBorder} text-base sm:text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-[var(--color-gunmetal)]'} hover:bg-[var(--glass-bg)] transition-colors duration-300`}
                >
                  <span>View Consulting</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
            
            {/* Stats or quick facts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.6,
                  delay: 0.5,
                  ease: [0.16, 0.77, 0.47, 0.97] 
                } 
              }}
              viewport={{ once: true, margin: "-20%" }}
              className="mt-12 grid grid-cols-2 gap-4 max-w-md mx-auto sm:mx-0"
            >
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className={`${cardBg} ${cardBorder} border rounded-xl p-4 text-center cursor-default`}
              >
                <div className="text-2xl sm:text-3xl font-bold text-[var(--color-orange-accent)] mb-1">5+</div>
                <div className={`text-xs sm:text-sm ${mutedTextColor}`}>Years Experience</div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className={`${cardBg} ${cardBorder} border rounded-xl p-4 text-center cursor-default`}
              >
                <div className="text-2xl sm:text-3xl font-bold text-[var(--color-orange-accent)] mb-1">50+</div>
                <div className={`text-xs sm:text-sm ${mutedTextColor}`}>Projects Completed</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
