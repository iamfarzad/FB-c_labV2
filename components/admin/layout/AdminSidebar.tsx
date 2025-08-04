"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  description: string
}

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (sectionId: string) => void
  navigationItems: NavItem[]
}

export function AdminSidebar({ activeSection, setActiveSection, navigationItems }: AdminSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="card-glass p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-auto p-3 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-lg hover:shadow-xl"
                    : "hover:bg-accent/5 hover:border-accent/20 text-foreground border border-transparent"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className={`text-xs truncate ${
                    isActive ? "text-accent-foreground/80" : "text-muted-foreground"
                  }`}>
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
