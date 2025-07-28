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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-auto p-3 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>{item.description}</div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
