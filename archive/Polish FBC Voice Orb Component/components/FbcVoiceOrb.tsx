"use client"

import { motion } from "motion/react"
import { cn } from "../lib/utils"

interface FbcVoiceOrbProps {
  className?: string
  state?: 'idle' | 'listening' | 'thinking' | 'talking' | 'browsing'
  isRecording?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
  disabled?: boolean
}

export function FbcVoiceOrb({ 
  className, 
  state = 'idle', 
  isRecording = false,
  size = 'md',
  onClick,
  disabled = false
}: FbcVoiceOrbProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-20 h-20'
      case 'md': return 'w-28 h-28'
      case 'lg': return 'w-40 h-40'
      case 'xl': return 'w-56 h-56'
      default: return 'w-28 h-28'
    }
  }

  // Organic breathing animation - always present for "alive" feel
  const getBreathingAnimation = () => {
    const baseBreathing = {
      scale: [1, 1.02, 1],
      transition: {
        duration: 4,
        ease: [0.4, 0, 0.6, 1],
        repeat: Infinity,
      }
    }

    switch (state) {
      case 'listening':
        return {
          scale: [1, 1.08, 1],
          transition: {
            duration: 2.5,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      case 'thinking':
        return {
          scale: [1, 1.03, 1.01, 1],
          transition: {
            duration: 3,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      case 'talking':
        return {
          scale: [1, 1.12, 1.04, 1],
          transition: {
            duration: 1.2,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      case 'browsing':
        return {
          scale: [1, 1.05, 1.02, 1],
          transition: {
            duration: 2,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      default:
        return baseBreathing
    }
  }

  // Sophisticated arc animation with organic movement
  const getArcAnimation = () => {
    switch (state) {
      case 'listening':
        return {
          opacity: [0.6, 1, 0.6],
          rotate: [0, 1, 0],
          transition: {
            duration: 3,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      case 'thinking':
        return {
          opacity: [0.4, 0.9, 0.4],
          rotate: [0, 3, -2, 1, 0],
          transition: {
            duration: 5,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      case 'talking':
        return {
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.03, 1],
          rotate: [0, 0.5, 0],
          transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      case 'browsing':
        return {
          opacity: [0.5, 1, 0.7, 0.5],
          rotate: [0, 2, -1, 0],
          transition: {
            duration: 4,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
      default:
        return {
          opacity: [0.7, 0.9, 0.7],
          transition: {
            duration: 6,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }
        }
    }
  }

  const getStateColors = () => {
    if (isRecording || state === 'listening') {
      return {
        primary: "#ff5b04",
        secondary: "#ff5b0440",
        accent: "#ff5b0460",
        dot: "bg-accent",
        glow: "#ff5b04"
      }
    }
    
    switch (state) {
      case 'thinking':
        return {
          primary: "#6366f1",
          secondary: "#6366f140",
          accent: "#6366f160",
          dot: "bg-indigo-500",
          glow: "#6366f1"
        }
      case 'talking':
        return {
          primary: "#10b981",
          secondary: "#10b98140",
          accent: "#10b98160",
          dot: "bg-emerald-500",
          glow: "#10b981"
        }
      case 'browsing':
        return {
          primary: "#8b5cf6",
          secondary: "#8b5cf640",
          accent: "#8b5cf660",
          dot: "bg-violet-500",
          glow: "#8b5cf6"
        }
      default:
        return {
          primary: "#ff5b04",
          secondary: "#ff5b0420",
          accent: "#ff5b0440",
          dot: "bg-accent",
          glow: "#ff5b04"
        }
    }
  }

  const colors = getStateColors()

  return (
    <motion.button
      className={cn(
        "relative focus:outline-none focus:ring-0 rounded-full",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]",
        "group",
        getSizeClasses(),
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, ...getBreathingAnimation() }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      aria-label={`AI Voice Interface - ${state} ${isRecording ? '(Recording)' : ''}`}
    >
      {/* Ambient Background Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)`
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: state === 'idle' ? [0.1, 0.2, 0.1] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Main Orb Container */}
      <motion.div
        className={cn(
          "relative w-full h-full rounded-full backdrop-blur-xl",
          "border border-white/10 shadow-2xl overflow-hidden",
          "bg-gradient-to-br from-white/5 to-white/0"
        )}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.secondary}80 40%, transparent 70%)`
        }}
      >
        {/* Inner Sphere with Glass Effect */}
        <div 
          className="absolute inset-1 rounded-full opacity-60"
          style={{
            background: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 30%, transparent 60%)`
          }}
        />
        
        {/* Dynamic Arc System */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={getArcAnimation()}
        >
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Primary Arc */}
            <motion.path
              d="M 25 20 A 40 40 0 0 1 75 20"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              stroke={colors.primary}
              style={{
                filter: `drop-shadow(0 0 8px ${colors.primary}80)`,
              }}
              animate={{
                pathLength: state === 'browsing' ? [0.8, 1, 0.6, 0.8] : 1,
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: state === 'browsing' ? 3 : 4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
            
            {/* Secondary Arc for Active States */}
            {state !== 'idle' && (
              <motion.path
                d="M 30 75 A 35 35 0 0 0 70 75"
                fill="none"
                strokeWidth="1"
                strokeLinecap="round"
                stroke={colors.primary}
                opacity="0.4"
                style={{
                  filter: `drop-shadow(0 0 4px ${colors.primary}60)`,
                }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0.7, 0],
                  opacity: [0, 0.6, 0.4, 0] 
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 0.5,
                }}
              />
            )}
          </svg>
        </motion.div>

        {/* Central Core - Pulsing Heart */}
        <motion.div
          className={cn(
            "absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            colors.dot,
            "shadow-lg"
          )}
          style={{
            boxShadow: `0 0 20px ${colors.primary}90, inset 0 0 10px ${colors.primary}60`
          }}
          animate={{
            scale: state === 'talking' ? [1, 2, 1.5, 1] : 
                  state === 'listening' ? [1, 1.8, 1] : 
                  [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: state === 'talking' ? 0.6 : state === 'listening' ? 2.5 : 4,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          }}
        />

        {/* Neural Network Lines for Thinking */}
        {state === 'thinking' && (
          <svg className="absolute inset-0 w-full h-full opacity-30">
            {[...Array(3)].map((_, i) => (
              <motion.line
                key={i}
                x1="50"
                y1="50"
                x2={30 + i * 20}
                y2={25 + i * 10}
                stroke={colors.primary}
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.6, 0] 
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </svg>
        )}

        {/* Ripple Effect for Active States */}
        {(state === 'listening' || state === 'talking') && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: `${colors.primary}30` }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: [0.9, 1.4, 0.9], 
                opacity: [0, 0.4, 0] 
              }}
              transition={{
                duration: 3,
                ease: "easeOut",
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: `${colors.primary}20` }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: [0.9, 1.6, 0.9], 
                opacity: [0, 0.3, 0] 
              }}
              transition={{
                duration: 3,
                ease: "easeOut",
                repeat: Infinity,
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Hover Enhancement */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${colors.primary}10 0%, transparent 60%)`
          }}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 bg-accent rounded-full shadow-lg"
            style={{
              boxShadow: `0 0 15px ${colors.primary}80`
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.6, 1],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>
    </motion.button>
  )
}