"use client"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle } from "lucide-react"

interface SidebarFooterProps {
  isTablet?: boolean
}

export const SidebarFooter = ({ isTablet = false }: SidebarFooterProps) => {
  return (
    <div className="mt-auto p-4 space-y-2">
      <Separator />
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size={isTablet ? "sm" : "default"}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
