"use client"

import type { Activity } from "@/types/chat"
import { AnimatePresence, motion } from "framer-motion"

interface DynamicActivityIndicatorProps {
  activity: Activity | null
}

export function DynamicActivityIndicator({ activity }: DynamicActivityIndicatorProps) {
  return (
    <AnimatePresence>
      {activity && activity.status === "in_progress" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-background border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
        >
          <motion.div
            className="flex items-center gap-1"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {activity.icon && <activity.icon className="w-4 h-4 text-primary" />}
          </motion.div>
          <span>{activity.title}</span>
          <div className="flex gap-1">
            <motion.span
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
            />
            <motion.span
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
            />
            <motion.span
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
