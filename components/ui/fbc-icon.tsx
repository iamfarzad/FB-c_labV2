"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FbcIconProps {
  className?: string
}

export function FbcIcon({ className }: FbcIconProps) {
  return (
    <motion.div
      className={cn("w-6 h-6", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      aria-label="F.B/c Orb Icon"
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
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
        </defs>

        {/* Main Orb */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          className="fill-[url(#orbGradient)] dark:fill-[url(#orbGradientDark)]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Satellite Arc */}
        <motion.path
          d="M 25 21 A 45 45 0 0 1 75 21"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-orange-accent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />

        {/* Core */}
        <motion.circle
          cx="50"
          cy="50"
          r="4"
          className="fill-orange-accent/80"
          style={{ filter: "url(#glow)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </svg>
    </motion.div>
  )
}
