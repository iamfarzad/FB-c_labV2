"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { MobileSidebarSheet } from "@/components/chat/sidebar/MobileSidebarSheet"
import type { ActivityItem } from "@/app/(chat)/chat/types/chat"

interface MobileMenuProps {
  activities: ActivityItem[]
  onNewChat: () => void
  onActivityClick: (activity: ActivityItem) => void
}

export function MobileMenu({ activities, onNewChat, onActivityClick }: MobileMenuProps) {
  return (
    <div className="md:hidden">
      <MobileSidebarSheet activities={activities} onNewChat={onNewChat} onActivityClick={onActivityClick}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-accent/10">
            <Menu className="w-4 h-4" />
          </Button>
        </motion.div>
      </MobileSidebarSheet>
    </div>
  )
}
