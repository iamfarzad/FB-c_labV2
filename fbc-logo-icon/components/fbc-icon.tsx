"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FbcIconProps {
  className?: string
}

export function FbcIcon({ className }: FbcIconProps) {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
    hover: { scale: 1.05 },
  }

  const orbVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 14 },
    },
  }

  const satellitePathVariants = {
    initial: { pathLength: 0 },
    animate: {
      pathLength: 1,
      transition: { duration: 1, ease: "circOut", delay: 0.5 },
    },
  }

  const shineVariants = {
    initial: { x: "-100%" },
    hover: { x: "100%", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <motion.div
      className={cn("w-16 h-16", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      aria-label="Polished F.B/c Orb Icon"
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
        <defs>
          <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="hsl(var(--color-light-silver))" />
            <stop offset="100%" stopColor="hsl(var(--color-light-silver-darker))" />
          </radialGradient>
          <radialGradient id="orbGradientDark" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="hsl(var(--color-gunmetal-lighter))" />
            <stop offset="100%" stopColor="hsl(var(--color-gunmetal))" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="shineGradient" gradientTransform="rotate(45)">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0.2" />
            <stop offset="60%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="orbMask">
            <circle cx="50" cy="50" r="40" fill="white" />
          </mask>
        </defs>

        {/* Main Orb */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          className="fill-[url(#orbGradient)] dark:fill-[url(#orbGradientDark)]"
          variants={orbVariants}
          animate={{
            ...orbVariants.animate,
            scale: [1, 1.015, 1],
          }}
          transition={{
            scale: {
              duration: 6,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            },
          }}
        />

        {/* Shine Effect */}
        <g mask="url(#orbMask)">
          <motion.rect x="0" y="0" width="100" height="100" fill="url(#shineGradient)" variants={shineVariants} />
        </g>

        {/* Satellite Arc */}
        <motion.path
          d="M 25 21 A 45 45 0 0 1 75 21"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-orange-accent"
          variants={satellitePathVariants}
        />

        {/* Core */}
        <motion.circle
          cx="50"
          cy="50"
          r="4"
          className="fill-orange-accent/80"
          style={{ filter: "url(#glow)" }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </svg>
    </motion.div>
  )
}
