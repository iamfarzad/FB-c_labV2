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
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:hidden">
            <select 
              value={activeSection} 
              onChange={(e) => setActiveSection(e.target.value as DashboardSection)}
              className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
            >
              {navigationItems.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          
          <div className="hidden lg:block">
            <AdminSidebar
              activeSection={activeSection}
              setActiveSection={(id) => setActiveSection(id as DashboardSection)}
              navigationItems={navigationItems}
            />
          </div>

          <main className="flex-1 min-w-0">
            <div className="card-glass overflow-hidden">
              <header className="border-b border-border/30 p-4 sm:p-6 bg-card/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{activeNavItem?.label}</h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">{activeNavItem?.description}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                    <Button variant="outline" size="sm" className="btn-minimal gap-2 flex-shrink-0">
                      <Search className="w-4 h-4" />
                      <span className="hidden sm:inline">Search</span>
                    </Button>
                    <Button variant="outline" size="sm" className="btn-minimal gap-2 flex-shrink-0">
                      <Filter className="w-4 h-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                    <Button variant="outline" size="sm" className="btn-minimal gap-2 flex-shrink-0">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </div>
                </div>
              </header>

              <div className="p-4 sm:p-6 bg-background/50">{renderSection()}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
