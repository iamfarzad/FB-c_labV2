"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIAvatar() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative cursor-pointer"
          >
      {/* Animated glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 opacity-75 blur-sm"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Main avatar */}
      <Avatar
        className={cn(
          "relative z-10 border-2 border-white/20 ring-1 ring-orange-500/30",
          "shadow-xl shadow-orange-500/25",
          // Responsive avatar sizes
          "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14",
        )}
      >
        <AvatarFallback className="bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 text-white shadow-inner">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className={cn("w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7")} />
          </motion.div>
        </AvatarFallback>
      </Avatar>
      
      {/* Floating particles */}
      <motion.div
        className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full opacity-60"
        animate={{
          y: [-2, -6, -2],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-red-400 rounded-full opacity-50"
        animate={{
          y: [2, 6, 2],
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>F.B/c AI Assistant - Ready to help!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
