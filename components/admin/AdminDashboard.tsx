"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { EmailTestPanel } from "./EmailTestPanel"
import { TokenCostAnalytics } from "./TokenCostAnalytics"
import { MeetingCalendar } from "./MeetingCalendar"
import { EmailCampaignManager } from "./EmailCampaignManager"
import { LeadsList } from "./LeadsList"
import { InteractionAnalytics } from "./InteractionAnalytics"
import { AIPerformanceMetrics } from "./AIPerformanceMetrics"
import { RealTimeActivity } from "./RealTimeActivity"
import { AdminChatInterface } from "./AdminChatInterface"
import { 
  BarChart3, Users, Calendar, Mail, DollarSign, Activity, TrendingUp, 
  Zap, Brain, Settings, LogOut, Home, ChevronRight, Plus, Search,
  Filter, Download, RefreshCw, Eye, Edit, Trash2, MoreHorizontal
} from "lucide-react"

type DashboardSection = 'overview' | 'leads' | 'meetings' | 'emails' | 'costs' | 'analytics' | 'ai-performance' | 'activity' | 'ai-assistant'

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, description: 'System overview and key metrics' },
    { id: 'leads', label: 'Leads', icon: Users, description: 'Lead management and scoring' },
    { id: 'meetings', label: 'Meetings', icon: Calendar, description: 'Meeting scheduling and tracking' },
    { id: 'emails', label: 'Emails', icon: Mail, description: 'Email campaigns and automation' },
    { id: 'costs', label: 'Costs', icon: DollarSign, description: 'AI usage and cost tracking' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Business performance insights' },
    { id: 'ai-performance', label: 'AI Performance', icon: Zap, description: 'AI model performance metrics' },
    { id: 'activity', label: 'Activity', icon: Activity, description: 'Real-time system activity' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain, description: 'AI-powered business intelligence' }
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />
      case 'leads':
        return <LeadsList searchTerm="" period="last_30_days" />
      case 'meetings':
        return <MeetingCalendar />
      case 'emails':
        return <EmailCampaignManager />
      case 'costs':
        return <TokenCostAnalytics />
      case 'analytics':
        return <InteractionAnalytics period="last_30_days" />
      case 'ai-performance':
        return <AIPerformanceMetrics period="last_30_days" />
      case 'activity':
        return <RealTimeActivity />
      case 'ai-assistant':
        return <div className="h-[calc(100vh-200px)]"><AdminChatInterface /></div>
      default:
        return <OverviewSection />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">F.B/c AI Admin</h1>
                  <p className="text-sm text-slate-500">Business Intelligence Dashboard</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Live
                </Badge>
                <span className="text-sm text-slate-500">Production Ready</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="space-y-2">
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
                      onClick={() => setActiveSection(item.id as DashboardSection)}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Section Header */}
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {navigationItems.find(item => item.id === activeSection)?.label}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      {navigationItems.find(item => item.id === activeSection)?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Search className="w-4 h-4" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6">
                {renderSection()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverviewSection() {
  const metrics = [
    {
      title: "Total Leads",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "blue"
    },
    {
      title: "Active Meetings",
      value: "23",
      change: "+5%",
      changeType: "positive",
      icon: Calendar,
      color: "green"
    },
    {
      title: "Email Campaigns",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: Mail,
      color: "purple"
    },
    {
      title: "Monthly Cost",
      value: "$2,847",
      change: "-8%",
      changeType: "negative",
      icon: DollarSign,
      color: "orange"
    }
  ]

  const quickActions = [
    {
      title: "Add New Lead",
      description: "Capture a new lead",
      icon: Plus,
      action: () => console.log("Add lead")
    },
    {
      title: "Schedule Meeting",
      description: "Book a consultation",
      icon: Calendar,
      action: () => console.log("Schedule meeting")
    },
    {
      title: "Send Email",
      description: "Create email campaign",
      icon: Mail,
      action: () => console.log("Send email")
    },
    {
      title: "View Analytics",
      description: "Check performance",
      icon: TrendingUp,
      action: () => console.log("View analytics")
    }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs font-medium ${
                        metric.changeType === "positive" ? "text-green-600" : "text-red-600"
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg bg-${metric.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-slate-50"
                  onClick={action.action}
                >
                  <Icon className="w-6 h-6 text-slate-600" />
                  <div className="text-center">
                    <div className="font-medium text-slate-900">{action.title}</div>
                    <div className="text-xs text-slate-500">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Email Test Panel */}
      <EmailTestPanel />

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Health</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">AI Services</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Email Service</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-600">New lead captured</span>
                <span className="text-xs text-slate-400 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Meeting scheduled</span>
                <span className="text-xs text-slate-400 ml-auto">5m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Email campaign sent</span>
                <span className="text-xs text-slate-400 ml-auto">12m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-slate-600">Cost alert triggered</span>
                <span className="text-xs text-slate-400 ml-auto">15m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
