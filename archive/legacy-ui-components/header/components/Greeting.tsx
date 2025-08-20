"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface GreetingProps {
  text: string
}

export function Greeting({ text }: GreetingProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.h1
        key={text}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "font-semibold text-foreground",
          // Responsive text sizes
          "text-sm md:text-base lg:text-lg",
        )}
      >
        {text}
      </motion.h1>
    </AnimatePresence>
  )
}
