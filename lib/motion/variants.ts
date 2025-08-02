/**
 * Motion Variants - Centralized animation settings
 * All animations should use these approved easing and duration settings
 */

// Animation Durations (mapped to CSS variables)
export const durations = {
  75: "var(--duration-75)",
  100: "var(--duration-100)", 
  150: "var(--duration-150)",
  200: "var(--duration-200)",
  300: "var(--duration-300)",
  500: "var(--duration-500)",
  700: "var(--duration-700)",
  1000: "var(--duration-1000)",
} as const

// Easing Functions (mapped to CSS variables)
export const easings = {
  linear: "var(--ease-linear)",
  in: "var(--ease-in)",
  out: "var(--ease-out)",
  inOut: "var(--ease-in-out)",
  bounce: "var(--ease-bounce)",
  smooth: "var(--ease-smooth)",
} as const

// Common Animation Variants
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const slideDownVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}

// Transition Presets
export const transitions = {
  fast: {
    duration: durations[150],
    ease: easings.out,
  },
  default: {
    duration: durations[200],
    ease: easings.out,
  },
  smooth: {
    duration: durations[300],
    ease: easings.smooth,
  },
  bounce: {
    duration: durations[300],
    ease: easings.bounce,
  },
  slow: {
    duration: durations[500],
    ease: easings.inOut,
  },
} as const

// Hover Effects
export const hoverEffects = {
  scale: {
    scale: 1.02,
    transition: transitions.fast,
  },
  scaleSmall: {
    scale: 1.01,
    transition: transitions.fast,
  },
  scaleLarge: {
    scale: 1.05,
    transition: transitions.fast,
  },
  lift: {
    y: -2,
    transition: transitions.fast,
  },
  liftLarge: {
    y: -4,
    transition: transitions.fast,
  },
} as const

// Loading Animations
export const loadingVariants = {
  pulse: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: {
        duration: durations[1000],
        repeat: Infinity,
        ease: easings.inOut,
      },
    },
  },
  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: durations[500],
        repeat: Infinity,
        ease: easings.bounce,
      },
    },
  },
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: durations[1000],
        repeat: Infinity,
        ease: easings.linear,
      },
    },
  },
} as const

// Stagger Animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// Chat-specific animations
export const chatBubbleVariants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: transitions.smooth,
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -20,
    transition: transitions.fast,
  },
}

// Voice animation variants
export const voiceOrbVariants = {
  idle: {
    scale: 1,
    opacity: 0.7,
  },
  listening: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: durations[1000],
      repeat: Infinity,
      ease: easings.inOut,
    },
  },
  speaking: {
    scale: [1, 1.2, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: durations[500],
      repeat: Infinity,
      ease: easings.bounce,
    },
  },
}

// Modal overlay variants
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

// Page transition variants
export const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default {
  durations,
  easings,
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  scaleVariants,
  modalVariants,
  transitions,
  hoverEffects,
  loadingVariants,
  staggerContainer,
  staggerItem,
  chatBubbleVariants,
  voiceOrbVariants,
  overlayVariants,
  pageVariants,
}
