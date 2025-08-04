"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FbcLogoProps {
  className?: string
}

const text = "F.B/c"

export function FbcLogo({ className }: FbcLogoProps) {
  const containerVariants = {
    initial: { opacity: 1 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  }

  const letterVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
      },
    },
  }

  return (
    <motion.div
      className={cn("group flex font-display text-4xl font-bold tracking-wide", className)}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      aria-label="F.B/c Logo"
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={letterVariants}
          className={cn(
            "relative transition-colors duration-300",
            char === "/"
              ? "text-orange-accent font-light mx-0.5"
              : "text-foreground group-hover:text-orange-accent-hover",
          )}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  )
}
