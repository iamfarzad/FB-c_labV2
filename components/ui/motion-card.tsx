"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRef } from "react"

interface MotionCardProps {
  children: React.ReactNode
  className?: string
}

export function MotionCard({ children, className }: MotionCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={ref}
      className={cn("group relative rounded-2xl border bg-background/60 backdrop-blur-xl", className)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty("--x", `${e.clientX - r.left}px`)
        el.style.setProperty("--y", `${e.clientY - r.top}px`)
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--x) var(--y), hsl(var(--accent)/0.12), transparent 60%)",
        }}
      />
      {children}
    </motion.div>
  )
}


