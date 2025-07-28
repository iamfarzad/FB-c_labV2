"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIAvatar() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Avatar
        className={cn(
          "border-2 border-accent/30 ring-2 ring-accent/10",
          "shadow-lg shadow-accent/20",
          // Responsive avatar sizes
          "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12",
        )}
      >
        <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-inner">
          <Bot className={cn("w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6")} />
        </AvatarFallback>
      </Avatar>
    </motion.div>
  )
}
