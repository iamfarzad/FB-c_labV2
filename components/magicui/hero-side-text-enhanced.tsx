"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useInView, Variants } from "framer-motion"
import { HyperText } from "@/components/ui/hyper-text"

type SectionConfig = {
  id: string
  lines: string[]
  /** Optional: Custom scroll offset for this section (0-1) */
  scrollOffset?: number
}

type HeroSideTextProps = {
  position: "left" | "right"
  /** @deprecated Use sections prop instead */
  lines?: string[]
  /** Array of section configurations */
  sections?: SectionConfig[]
  className?: string
  /** Optional: Scroll container ref (defaults to window) */
  scrollContainerRef?: React.RefObject<HTMLElement>
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.1,
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  })
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

export const HeroSideText: React.FC<HeroSideTextProps> = ({ 
  position, 
  lines,
  sections: sectionsProp,
  className = "",
  scrollContainerRef
}) => {
  // Handle backward compatibility
  const sections = sectionsProp || (lines ? [{ id: 'default', lines }] : [])
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [currentSection, setCurrentSection] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedLines, setDisplayedLines] = useState<string[]>(sections[0]?.lines || [])

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
          setDisplayedLines(sections[newSection].lines)
          setTimeout(() => setIsAnimating(false), 300) // Match this with your animation duration
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

  return (
    <motion.div
      ref={ref}
      className={`fixed top-[40%] z-40 ${position === "left" ? "left-6 text-left" : "right-6 text-right"} ${className}`}
      style={{
        maxWidth: 140,
        opacity: 0.7,
      }}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div className="space-y-2">
        {displayedLines.map((line, i) => (
          <motion.div 
            key={`${currentSection}-${i}`} 
            className="overflow-hidden"
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.1
            }}
          >
            <HyperText 
              text={line}
              duration={1000}
              framerProps={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -10 },
              }}
              className={cn(
                "text-xs font-tech uppercase tracking-wide whitespace-pre-wrap leading-snug",
                "text-white/80 hover:text-white transition-colors duration-300"
              )}
              animateOnLoad={isInView}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// Helper function to merge class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
