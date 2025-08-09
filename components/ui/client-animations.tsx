"use client"

import { motion } from "framer-motion"
import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, staggerItem, slideUpVariants, transitions } from "@/lib/motion/variants"

export function MotionStagger({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div className={cn(className)} variants={staggerContainer} initial="initial" animate="animate">
      {children}
    </motion.div>
  )
}

export function MotionItem({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div className={cn(className)} variants={staggerItem} transition={transitions.smooth}>
      {children}
    </motion.div>
  )
}

export function MotionRise({ className, children, delay = 0 }: { className?: string; children: ReactNode; delay?: number }) {
  return (
    <motion.div className={cn(className)} variants={slideUpVariants} initial="initial" animate="animate" transition={{ ...transitions.smooth, delay }}>
      {children}
    </motion.div>
  )
}