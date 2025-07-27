"use client"

import React, { useState } from 'react'
import { VerticalProcessChain } from './VerticalProcessChain'
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FixedVerticalProcessChainProps {
  activities: ActivityItem[]
  onActivityClick?: (activity: ActivityItem) => void
}

export function FixedVerticalProcessChain({ activities, onActivityClick }: FixedVerticalProcessChainProps) {
  const [isVisible, setIsVisible] = useState(false)

  React.useEffect(() => {
    // Show the chain after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="pointer-events-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              {/* Glowing background effect */}
              <motion.div
                className="absolute inset-0 bg-accent/10 rounded-full blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main chain container */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/30 rounded-2xl shadow-xl shadow-black/10 p-2">
                <VerticalProcessChain 
                  activities={activities} 
                  onActivityClick={onActivityClick}
                  className="min-w-[48px]"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 