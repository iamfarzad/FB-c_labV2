import { Variants } from "framer-motion"

// Animation variants for the VoiceOrb component
export const orbAnimations = {
  // Main orb animations for different states
  idle: {
    scale: 1,
    rotate: 0,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
  },
  listening: {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 0 rgba(239, 68, 68, 0.4)",
      "0 0 0 20px rgba(239, 68, 68, 0)",
      "0 0 0 0 rgba(239, 68, 68, 0.4)"
    ],
  },
  processing: {
    scale: [1, 1.05, 1],
    rotate: [0, 360],
  },
  responding: {
    scale: [1, 1.03, 1],
    boxShadow: [
      "0 0 0 0 rgba(34, 197, 94, 0.4)",
      "0 0 0 15px rgba(34, 197, 94, 0)",
      "0 0 0 0 rgba(34, 197, 94, 0.4)"
    ],
  },
  thinking: {
    scale: [1, 1.04, 1],
    boxShadow: [
      "0 0 0 0 rgba(168, 85, 247, 0.4)",
      "0 0 0 18px rgba(168, 85, 247, 0)",
      "0 0 0 0 rgba(168, 85, 247, 0.4)"
    ],
  },
  browsing: {
    scale: 1,
    rotate: [0, 360],
  },
  analyzing: {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 0 0 0 rgba(59, 130, 246, 0.4)",
      "0 0 0 12px rgba(59, 130, 246, 0)",
      "0 0 0 0 rgba(59, 130, 246, 0.4)"
    ],
  },

  // Waveform animations for different states
  waveform: {
    idle: { height: 4 },
    listening: { height: [4, 12, 4] },
    processing: { height: [4, 16, 4] },
    responding: { height: [4, 14, 4] },
    thinking: { height: [4, 10, 4] },
    browsing: { height: [4, 8, 4] },
    analyzing: { height: [4, 13, 4] },
  },

  // Pulse ring animations
  pulseRings: {
    idle: { scale: 1, opacity: 0 },
    listening: { scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] },
    processing: { scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] },
    responding: { scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] },
    thinking: { scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] },
    browsing: { scale: [1, 1.2, 1], opacity: [0.25, 0, 0.25] },
    analyzing: { scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] },
  },
} as const

// Particle animation variants
export const particleAnimations: Variants = {
  processing: {
    x: [0, 60, 0],
    y: [0, 60, 0],
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

// Icon animation variants
export const iconAnimations: Variants = {
  processing: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  browsing: {
    rotate: [0, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

// Modal animations
export const modalAnimations = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    initial: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20 
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20 
    },
  },
}

// Button hover animations
export const buttonAnimations = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}

// Text animation variants
export const textAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4 },
  },
}
