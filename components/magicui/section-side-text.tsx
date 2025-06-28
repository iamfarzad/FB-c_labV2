"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, useInView, Variants } from "framer-motion"
import { HyperText } from "@/components/ui/hyper-text"

type SectionConfig = {
  id: string
  title: string
  /** Optional: Custom scroll offset for this section (0-1) */
  scrollOffset?: number
}

type SectionSideTextProps = {
  position: "left" | "right"
  sections: SectionConfig[]
  className?: string
  /** Optional: Scroll container ref (defaults to window) */
  scrollContainerRef?: React.RefObject<HTMLElement>
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.4,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
};

export const SectionSideText: React.FC<SectionSideTextProps> = ({
  position,
  sections,
  className = "",
  scrollContainerRef
}) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Handle section changes based on scroll position
  useEffect(() => {
    if (sections.length <= 1) return

    const container = scrollContainerRef?.current || window

    const handleScroll = () => {
      if (isAnimating) return

      const scrollPosition = container === window
        ? window.scrollY
        : (container as HTMLElement).scrollTop

      const windowHeight = container === window
        ? window.innerHeight
        : (container as HTMLElement).clientHeight

      const scrollPercentage = scrollPosition / (document.body.scrollHeight - windowHeight)

      // Find the current section based on scroll position
      let newSection = 0
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        const sectionThreshold = section.scrollOffset !== undefined
          ? section.scrollOffset
          : i / (sections.length - 1)

        if (scrollPercentage >= sectionThreshold) {
          newSection = i
        } else {
          break
        }
      }

      if (newSection !== currentSection) {
        setIsAnimating(true)
        setCurrentSection(newSection)

        // Smooth transition between texts
        setTimeout(() => {
          setTimeout(() => setIsAnimating(false), 300)
        }, 50)
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [sections, currentSection, isAnimating, scrollContainerRef])

  if (sections.length === 0) return null

  return (
    <motion.div
      ref={ref}
      className={`fixed top-[40%] z-40 ${position === "left" ? "left-6 text-left" : "right-6 text-right"} ${className}`}
      style={{
        maxWidth: 140,
        opacity: 0.7,
      }}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        key={sections[currentSection].id}
        className="overflow-hidden"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <HyperText
          text={sections[currentSection].title}
          duration={1000}
          framerProps={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
          }}
          className="text-xs font-tech uppercase tracking-wide whitespace-pre-wrap leading-snug text-white/80 hover:text-white transition-colors duration-300"
        />
      </motion.div>
    </motion.div>
  )
}
