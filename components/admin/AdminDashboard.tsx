"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AdminHeader } from "./layout/AdminHeader"
import { AdminSidebar } from "./layout/AdminSidebar"
import { OverviewSection } from "./sections/OverviewSection"
import { EmailCampaignManager } from "./EmailCampaignManager"
import { LeadsList } from "./LeadsList"
import { InteractionAnalytics } from "./InteractionAnalytics"
import { AIPerformanceMetrics } from "./AIPerformanceMetrics"
import { RealTimeActivity } from "./RealTimeActivity"
import { AdminChatInterface } from "./AdminChatInterface"
import { TokenCostAnalytics } from "./TokenCostAnalytics"
import { MeetingCalendar } from "./MeetingCalendar"
import {
  Home,
  Users,
  Calendar,
  Mail,
  DollarSign,
  Activity,
  TrendingUp,
  Zap,
  Brain,
  Search,
  Filter,
  Download,
} from "lucide-react"

type DashboardSection =
  | "overview"
  | "leads"
  | "meetings"
  | "emails"
  | "costs"
  | "analytics"
  | "ai-performance"
  | "activity"
  | "ai-assistant"

const navigationItems = [
  { id: "overview", label: "Overview", icon: Home, description: "System overview and key metrics" },
  { id: "leads", label: "Leads", icon: Users, description: "Lead management and scoring" },
  { id: "meetings", label: "Meetings", icon: Calendar, description: "Meeting scheduling and tracking" },
  { id: "emails", label: "Emails", icon: Mail, description: "Email campaigns and automation" },
  { id: "costs", label: "Costs", icon: DollarSign, description: "AI usage and cost tracking" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, description: "Business performance insights" },
  { id: "ai-performance", label: "AI Performance", icon: Zap, description: "AI model performance metrics" },
  { id: "activity", label: "Activity", icon: Activity, description: "Real-time system activity" },
  { id: "ai-assistant", label: "AI Assistant", icon: Brain, description: "AI-powered business intelligence" },
]

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview")

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection />
      case "leads":
        return <LeadsList searchTerm="" period="last_30_days" />
      case "meetings":
        return <MeetingCalendar />
      case "emails":
        return <EmailCampaignManager />
      case "costs":
        return <TokenCostAnalytics />
      case "analytics":
        return <InteractionAnalytics period="last_30_days" />
      case "ai-performance":
        return <AIPerformanceMetrics period="last_30_days" />
      case "activity":
        return <RealTimeActivity />
      case "ai-assistant":
        return (
          <div className="h-[calc(100vh-200px)]">
            <AdminChatInterface />
          </div>
        )
      default:
        return <OverviewSection />
    }
  }

  const activeNavItem = navigationItems.find((item) => item.id === activeSection)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={(id) => setActiveSection(id as DashboardSection)}
            navigationItems={navigationItems}
          />

          <main className="flex-1">
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <header className="border-b border-border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">{activeNavItem?.label}</h2>
                    <p className="text-muted-foreground mt-1">{activeNavItem?.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Search className="w-4 h-4" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </header>

              <div className="p-6">{renderSection()}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
