"use client"

import * as React from 'react'
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sparkles, Zap, Brain } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeroEnhancedProps {
  theme: "light" | "dark"
  onStartChat: () => void
}

const HeroEnhanced: React.FC<HeroEnhancedProps> = ({ theme, onStartChat }) => {
  const features = [
    { icon: Brain, text: "AI-Powered Intelligence" },
    { icon: Zap, text: "Lightning Fast Responses" },
    { icon: Sparkles, text: "Creative Problem Solving" },
  ]

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"
  const mutedTextColor = theme === "dark" ? "text-[var(--color-light-silver)]/90" : "text-[var(--color-gunmetal)]/80"

  // Mouse position effect for glass tilt
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20
    })
  }

  const resetMousePosition = () => {
    setMousePosition({ x: 0, y: 0 })
  }

  // Scroll effect for parallax
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, 50])

  // Memoize the background orbs to prevent re-renders
  const backgroundOrbs = React.useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      size: Math.random() * 200 + 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      blur: Math.random() * 50 + 25,
      opacity: Math.random() * 0.2 + 0.1,
      delay: Math.random() * 2
    }))
  }, [])

  return (
    <div className="relative py-20 md:py-32 overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 -z-10 overflow-hidden"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle at 70% 30%, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.98) 100%)'
            : 'radial-gradient(circle at 70% 30%, rgba(249, 250, 251, 0.9) 0%, rgba(255, 255, 255, 0.98) 100%)',
        }}
      >
        {backgroundOrbs.map((orb) => (
          <motion.div
            key={orb.id}
            className="absolute rounded-full mix-blend-overlay"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              filter: `blur(${orb.blur}px)`,
              opacity: orb.opacity,
              background: theme === 'dark' 
                ? `radial-gradient(circle, rgba(255,255,255,${orb.opacity * 1.5}) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(59, 130, 246,${orb.opacity * 1.5}) 0%, transparent 70%)`,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: orb.delay,
            }}
          />
        ))}
      </motion.div>

      {/* Main content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 relative z-20"
          >
            {/* Enhanced Badge with Glass Effect */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={cn(
                "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium mb-6",
                "bg-gradient-to-r from-primary/10 to-primary/5",
                "backdrop-blur-sm border border-primary/20",
                "shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Solutions
            </motion.div>

            {/* Enhanced Main Headline */}
            <motion.h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${textColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Transform Your Business with
              <span className="relative inline-block">
                <motion.span 
                  className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: '100% 50%' }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'linear',
                  }}
                >
                  {' '}AI Innovation
                </motion.span>
                <motion.span 
                  className="absolute bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 to-primary/10 -rotate-1 -z-0 rounded-full"
                  initial={{ scaleX: 0.8, opacity: 0.8 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                  }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <p className={`text-lg md:text-xl ${mutedTextColor} mb-8 max-w-lg`}>
              Leverage cutting-edge AI technology to solve complex business challenges and drive growth. 
              Our solutions are tailored to your unique needs.
            </p>

            {/* Enhanced CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <Button 
                  onClick={onStartChat}
                  className={cn(
                    "relative overflow-hidden px-8 py-6 text-lg font-semibold",
                    "bg-gradient-to-r from-primary to-primary/90 text-white",
                    "transform transition-all duration-300 ease-out",
                    "hover:shadow-lg hover:shadow-primary/20"
                  )}
                  size="lg"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  className={cn(
                    "px-8 py-6 text-lg font-semibold relative overflow-hidden",
                    "bg-transparent border-2 border-primary/20 hover:border-primary/40",
                    "text-primary hover:text-primary/90 hover:bg-primary/5",
                    "transition-all duration-300"
                  )}
                  size="lg"
                >
                  <Link href="/demo" className="flex items-center">
                    See Demo <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className={`text-sm ${mutedTextColor}`}>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Visual with Liquid Glass Effect */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={resetMousePosition}
          >
            <motion.div 
              className={cn(
                "relative rounded-2xl overflow-hidden p-0.5",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
                "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]"
              )}
              style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.4), rgba(17, 24, 39, 0.4))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(243, 244, 246, 0.4))',
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                }}
              />
              <motion.div 
                className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-secondary/50 backdrop-blur-sm"
                animate={{ 
                  y: [0, -15, 0],
                  x: [0, 5, 0],
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HeroEnhanced
