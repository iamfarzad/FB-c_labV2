"use client"

import { DemoSessionCard } from "../DemoSessionCard"

interface SidebarFooterProps {
  isTablet?: boolean
}

export const SidebarFooter = ({ isTablet = false }: SidebarFooterProps) => {
  return (
    <div className="p-4 border-t border-border/20">
      <DemoSessionCard isTablet={isTablet} />
    </div>
  )
}
