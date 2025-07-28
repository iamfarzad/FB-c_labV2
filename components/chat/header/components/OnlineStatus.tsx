"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function OnlineStatus() {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50"
      />
      <Badge
        variant="secondary"
        className={cn(
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          "border border-green-200 dark:border-green-800",
          "text-xs px-1.5 py-0.5 md:px-2 lg:py-1",
        )}
      >
        Online • Ready to help
      </Badge>
    </div>
  )
}
