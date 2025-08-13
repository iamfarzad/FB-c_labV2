"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmailTestPanel } from "@/components/admin/EmailTestPanel"
import { Users, Calendar, Mail, DollarSign, Activity, TrendingUp, Zap, Plus } from "lucide-react"
import { BookCallButton } from '@/components/meeting/BookCallButton'

const metrics = [
  {
    title: "Total Leads",
    value: "1,247",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    color: "blue",
  },
  {
    title: "Active Meetings",
    value: "23",
    change: "+5%",
    changeType: "positive",
    icon: Calendar,
    color: "green",
  },
  {
    title: "Email Campaigns",
    value: "8",
    change: "+2",
    changeType: "positive",
    icon: Mail,
    color: "purple",
  },
  {
    title: "Monthly Cost",
    value: "$2,847",
    change: "-8%",
    changeType: "negative",
    icon: DollarSign,
    color: "orange",
  },
]

const quickActions = [
  {
    title: "Add New Lead",
    description: "Capture a new lead",
    icon: Plus,
    action: () => console.log("Add lead"),
  },
  // Button will be swapped at render to open MeetingOverlay
  {
    title: "Send Email",
    description: "Create email campaign",
    icon: Mail,
    action: () => console.log("Send email"),
  },
  {
    title: "View Analytics",
    description: "Check performance",
    icon: TrendingUp,
    action: () => console.log("View analytics"),
  },
]

export function OverviewSection() {
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
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-xs font-medium ${
                          metric.changeType === "positive" ? "text-green-600" : "text-destructive"
                        }`}
                      >
                        {metric.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
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
            {/* Add New Lead */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/5 bg-transparent border border-border/30 hover:border-accent/30"
              onClick={() => console.log('Add lead')}
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="font-medium text-foreground">Add New Lead</div>
                <div className="text-xs text-muted-foreground">Capture a new lead</div>
              </div>
            </Button>

            {/* Schedule Meeting */}
            <BookCallButton
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/5 bg-transparent border border-border/30 hover:border-accent/30"
              title="Book a Consultation"
            >
              <Calendar className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="font-medium text-foreground">Schedule Meeting</div>
                <div className="text-xs text-muted-foreground">Book a consultation</div>
              </div>
            </BookCallButton>

            {/* Send Email */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/5 bg-transparent border border-border/30 hover:border-accent/30"
              onClick={() => console.log('Send email')}
            >
              <Mail className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="font-medium text-foreground">Send Email</div>
                <div className="text-xs text-muted-foreground">Create email campaign</div>
              </div>
            </Button>

            {/* View Analytics */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-accent/5 bg-transparent border border-border/30 hover:border-accent/30"
              onClick={() => console.log('View analytics')}
            >
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
              <div className="text-center">
                <div className="font-medium text-foreground">View Analytics</div>
                <div className="text-xs text-muted-foreground">Check performance</div>
              </div>
            </Button>
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
                <span className="text-sm text-muted-foreground">API Health</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Services</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Service</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Active
                </Badge>
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
                <span className="text-sm text-muted-foreground">New lead captured</span>
                <span className="text-xs text-muted-foreground/60 ml-auto">2m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Meeting scheduled</span>
                <span className="text-xs text-muted-foreground/60 ml-auto">5m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Email campaign sent</span>
                <span className="text-xs text-muted-foreground/60 ml-auto">12m ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-muted-foreground">Cost alert triggered</span>
                <span className="text-xs text-muted-foreground/60 ml-auto">15m ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
