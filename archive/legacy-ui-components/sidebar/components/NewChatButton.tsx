"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface NewChatButtonProps {
  onNewChat: () => void
  isTablet?: boolean
}

export const NewChatButton = ({ onNewChat, isTablet = false }: NewChatButtonProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400 }}>
      <Button
        onClick={onNewChat}
        variant="outline"
        className={cn(
          "w-full justify-start gap-2 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-accent/20 focus:ring-offset-2",
          isTablet ? "h-9 text-sm" : "h-10",
        )}
      >
        <Plus className={cn("w-4 h-4")} />
        <span>New Chat</span>
      </Button>
    </motion.div>
  )
}
