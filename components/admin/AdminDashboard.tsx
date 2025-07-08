"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmailTestPanel } from "./EmailTestPanel"
import { TokenCostAnalytics } from "./TokenCostAnalytics"
import { MeetingCalendar } from "./MeetingCalendar"
import { EmailCampaignManager } from "./EmailCampaignManager"
import { LeadsList } from "./LeadsList"
import { InteractionAnalytics } from "./InteractionAnalytics"
import { AIPerformanceMetrics } from "./AIPerformanceMetrics"
import { RealTimeActivity } from "./RealTimeActivity"
import { BarChart3, Users, Calendar, Mail, DollarSign, Activity, TrendingUp, Zap } from "lucide-react"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">F.B/c AI Admin Dashboard</h1>
            <p className="text-muted-foreground">Complete business management and analytics platform</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            ✅ Production Ready
          </Badge>
        </div>

        {/* Email Test Panel - Always visible at top */}
        <EmailTestPanel />

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Meetings
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Performance
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lead Management
                  </CardTitle>
                  <CardDescription>Comprehensive lead tracking and scoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Real-time lead capture</li>
                    <li>✅ AI-powered lead scoring</li>
                    <li>✅ Engagement tracking</li>
                    <li>✅ Export capabilities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Meeting Scheduler
                  </CardTitle>
                  <CardDescription>30-minute consultation booking system</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Calendar integration</li>
                    <li>✅ Email confirmations</li>
                    <li>✅ Status tracking</li>
                    <li>✅ Video meeting links</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Automation
                  </CardTitle>
                  <CardDescription>Professional email campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Lead follow-ups</li>
                    <li>✅ Meeting reminders</li>
                    <li>✅ Segment targeting</li>
                    <li>✅ Professional templates</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Cost Tracking
                  </CardTitle>
                  <CardDescription>AI API usage and cost monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Multi-provider tracking</li>
                    <li>✅ Real-time cost calculation</li>
                    <li>✅ Usage analytics</li>
                    <li>✅ Budget monitoring</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Business Analytics
                  </CardTitle>
                  <CardDescription>Comprehensive performance insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Engagement metrics</li>
                    <li>✅ Conversion tracking</li>
                    <li>✅ Peak hours analysis</li>
                    <li>✅ ROI calculations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Real-time Monitoring
                  </CardTitle>
                  <CardDescription>Live system activity and health</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Live activity feed</li>
                    <li>✅ System health monitoring</li>
                    <li>✅ Error tracking</li>
                    <li>✅ Performance metrics</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads">
            <LeadsList />
          </TabsContent>

          <TabsContent value="meetings">
            <MeetingCalendar />
          </TabsContent>

          <TabsContent value="emails">
            <EmailCampaignManager />
          </TabsContent>

          <TabsContent value="costs">
            <TokenCostAnalytics />
          </TabsContent>

          <TabsContent value="analytics">
            <InteractionAnalytics />
          </TabsContent>

          <TabsContent value="ai-performance">
            <AIPerformanceMetrics />
          </TabsContent>

          <TabsContent value="activity">
            <RealTimeActivity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
