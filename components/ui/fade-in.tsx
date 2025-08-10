"use client"

import type React from "react"
import { motion } from "framer-motion"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  y?: number
}

export function FadeIn({ children, delay = 0, y = 8 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}


