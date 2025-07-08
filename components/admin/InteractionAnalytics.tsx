"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { MessageSquare, Mic, Video, Share, ImageIcon } from "lucide-react"

interface InteractionAnalyticsProps {
  period: string
}

interface AnalyticsData {
  engagementTypes: Array<{ name: string; value: number; color: string }>
  dailyInteractions: Array<{ date: string; interactions: number; leads: number }>
  aiCapabilities: Array<{ capability: string; usage: number; conversion: number }>
  averageSessionTime: number
  totalInteractions: number
  peakHours: Array<{ hour: number; interactions: number }>
}

export function InteractionAnalytics({ period }: InteractionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    engagementTypes: [],
    dailyInteractions: [],
    aiCapabilities: [],
    averageSessionTime: 0,
    totalInteractions: 0,
    peakHours: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEngagementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "chat":
        return <MessageSquare className="w-4 h-4" />
      case "voice":
        return <Mic className="w-4 h-4" />
      case "webcam":
        return <Video className="w-4 h-4" />
      case "screen_share":
        return <Share className="w-4 h-4" />
      case "image":
        return <ImageIcon className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Engagement Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analytics.engagementTypes.map((type, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{type.name}</CardTitle>
              {getEngagementIcon(type.name)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{type.value}</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(type.value / Math.max(...analytics.engagementTypes.map((t) => t.value))) * 100}%`,
                    backgroundColor: type.color,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Interactions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Interactions</CardTitle>
            <CardDescription>Interactions and lead generation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyInteractions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="interactions" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="leads" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
            <CardDescription>How users interact with the AI</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.engagementTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.engagementTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Capabilities Usage */}
        <Card>
          <CardHeader>
            <CardTitle>AI Capabilities Performance</CardTitle>
            <CardDescription>Usage and conversion rates by capability</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.aiCapabilities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="capability" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage" fill="#8884d8" />
                <Bar dataKey="conversion" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Activity Hours</CardTitle>
            <CardDescription>When users are most active</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interactions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Capabilities Detailed List */}
      <Card>
        <CardHeader>
          <CardTitle>AI Capabilities Analysis</CardTitle>
          <CardDescription>Detailed breakdown of AI feature usage and effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.aiCapabilities.map((capability, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{capability.capability}</h4>
                    <Badge variant="outline">{capability.usage} uses</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage Rate</span>
                      <span>{capability.usage}%</span>
                    </div>
                    <Progress value={capability.usage} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Conversion Rate</span>
                      <span>{capability.conversion}%</span>
                    </div>
                    <Progress value={capability.conversion} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
