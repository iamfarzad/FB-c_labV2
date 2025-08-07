"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FbcVoiceOrbProps {
  className?: string
  state?: 'idle' | 'listening' | 'thinking' | 'talking' | 'browsing'
  isRecording?: boolean
}

export function FbcVoiceOrb({ className, state = 'idle', isRecording = false }: FbcVoiceOrbProps) {
  // Different animation patterns for each state
  const getArcAnimation = () => {
    switch (state) {
      case 'listening':
        return {
          rotate: 360,
          transition: {
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }
        }
      case 'thinking':
        return {
          rotate: [0, 180, 360],
          transition: {
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }
        }
      case 'talking':
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
          transition: {
            duration: 0.5,
            ease: "easeInOut",
            repeat: Infinity,
          }
        }
      case 'browsing':
        return {
          pathLength: [0, 1, 0],
          transition: {
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
          }
        }
      default:
        return {
          rotate: 0,
          transition: {
            duration: 0.3,
          }
        }
    }
  }

  const getCoreAnimation = () => {
    switch (state) {
      case 'listening':
        return {
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
          transition: {
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
          }
        }
      case 'thinking':
        return {
          scale: [1, 1.2, 1.1, 1],
          transition: {
            duration: 1,
            ease: "easeInOut",
            repeat: Infinity,
          }
        }
      case 'talking':
        return {
          scale: [1, 1.4, 1.2, 1],
          opacity: [1, 0.9, 1, 0.9],
          transition: {
            duration: 0.3,
            ease: "easeOut",
            repeat: Infinity,
          }
        }
      case 'browsing':
        return {
          scale: [1, 1.1, 1],
          rotate: 360,
          transition: {
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }
        }
      default:
        return {
          scale: 1,
          opacity: 0.8,
        }
    }
  }

  const getOrbColor = () => {
    if (isRecording) return "fill-red-500/20 dark:fill-red-500/30"
    switch (state) {
      case 'listening': return "fill-red-500/20 dark:fill-red-500/30"
      case 'thinking': return "fill-blue-500/20 dark:fill-blue-500/30"
      case 'talking': return "fill-green-500/20 dark:fill-green-500/30"
      case 'browsing': return "fill-purple-500/20 dark:fill-purple-500/30"
      default: return "fill-orange-500/10 dark:fill-orange-500/20"
    }
  }

  const getArcColor = () => {
    if (isRecording) return "stroke-red-500"
    switch (state) {
      case 'listening': return "stroke-red-500"
      case 'thinking': return "stroke-blue-500"
      case 'talking': return "stroke-green-500"
      case 'browsing': return "stroke-purple-500"
      default: return "stroke-orange-500"
    }
  }

  const getCoreColor = () => {
    if (isRecording) return "fill-red-500"
    switch (state) {
      case 'listening': return "fill-red-500"
      case 'thinking': return "fill-blue-500"
      case 'talking': return "fill-green-500"
      case 'browsing': return "fill-purple-500"
      default: return "fill-orange-500"
    }
  }

  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      aria-label="F.B/c Voice Orb"
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          {/* Inverted gradient - dark center, light edges */}
          <radialGradient id="invertedOrbGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0.1" />
            <stop offset="70%" stopColor="hsl(var(--background))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.5" />
          </radialGradient>
          
          {/* Glow effect */}
          <filter id="voiceGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pulse effect for talking */}
          <filter id="talkPulse">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feFlood floodColor="currentColor" floodOpacity="0.3" />
            <feComposite in2="coloredBlur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Orb (Inverted) */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          className={cn("transition-colors duration-300", getOrbColor())}
          style={{ filter: state === 'talking' ? "url(#talkPulse)" : undefined }}
          animate={{
            r: state === 'listening' ? [40, 42, 40] : 40,
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: state === 'listening' ? Infinity : 0,
          }}
        />

        {/* Satellite Arc - The signature F.B/c element */}
        <motion.g animate={getArcAnimation()}>
          <motion.path
            d="M 25 21 A 45 45 0 0 1 75 21"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn("transition-colors duration-300", getArcColor())}
            style={{ filter: "url(#voiceGlow)" }}
            initial={{ pathLength: state === 'browsing' ? 0 : 1 }}
            animate={state === 'browsing' ? { pathLength: [0, 1, 0] } : { pathLength: 1 }}
            transition={state === 'browsing' ? {
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity,
            } : undefined}
          />
        </motion.g>

        {/* Additional arcs for thinking state */}
        {state === 'thinking' && (
          <>
            <motion.path
              d="M 30 70 A 35 35 0 0 0 70 70"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-blue-400/50"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.path
              d="M 20 50 A 40 40 0 0 1 35 30"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-blue-400/50"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 1,
              }}
            />
          </>
        )}

        {/* Core - Animated based on state */}
        <motion.circle
          cx="50"
          cy="50"
          r="5"
          className={cn("transition-colors duration-300", getCoreColor())}
          style={{ filter: "url(#voiceGlow)" }}
          animate={getCoreAnimation()}
        />

        {/* Sound waves for talking state */}
        {state === 'talking' && (
          <>
            <motion.circle
              cx="50"
              cy="50"
              r="10"
              fill="none"
              strokeWidth="1"
              className="stroke-green-500/30"
              initial={{ r: 5, opacity: 1 }}
              animate={{ r: 45, opacity: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
                repeat: Infinity,
              }}
            />
            <motion.circle
              cx="50"
              cy="50"
              r="10"
              fill="none"
              strokeWidth="1"
              className="stroke-green-500/30"
              initial={{ r: 5, opacity: 1 }}
              animate={{ r: 45, opacity: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut",
                repeat: Infinity,
                delay: 0.3,
              }}
            />
          </>
        )}
      </svg>
    </motion.div>
  )
}