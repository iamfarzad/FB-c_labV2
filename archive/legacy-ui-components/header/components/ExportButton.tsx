"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeviceInfo } from "@/hooks/use-device"

interface ExportButtonProps {
  onClick: () => void
  device: DeviceInfo
}

export function ExportButton({ onClick, device }: ExportButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <Button
        variant="outline"
        size={device.isMobile ? "sm" : "default"}
        onClick={onClick}
        className={cn(
          "gap-2 hover:bg-accent/10 hover:border-accent/30",
          "shadow-sm hover:shadow-md transition-all duration-200",
          "focus:ring-2 focus:ring-accent/20 focus:ring-offset-2",
          // Mobile: Icon only, larger screens: Icon + text
          "px-2 md:px-3 lg:px-4",
        )}
      >
        <FileText className="w-4 h-4" />
        {!device.isMobile && <span className="hidden md:inline">Export Summary</span>}
      </Button>
    </motion.div>
  )
}
