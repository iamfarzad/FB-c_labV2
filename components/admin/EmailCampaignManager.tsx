"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, Users, TrendingUp, RefreshCw, Plus, CheckCircle } from "lucide-react"

interface EmailCampaign {
  id: string
  name: string
  subject: string
  template: string
  target_segment: string
  status: string
  sent_count: number
  created_at: string
}

interface LeadSegment {
  name: string
  description: string
  count: number
  filter: string
}

export function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [segments, setSegments] = useState<LeadSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    template: "lead-followup",
    targetSegment: "high-score-leads",
  })

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/email-campaigns")
      const data = await response.json()
      setCampaigns(data)
    } catch (error) {
      console.error("Failed to fetch campaigns:", error)
    }
  }

  const fetchSegments = async () => {
    try {
      const response = await fetch("/api/admin/leads?segments=true")
      const data = await response.json()

      // Mock segments for now - in production, calculate from actual lead data
      setSegments([
        {
          name: "High Score Leads",
          description: "Leads with score > 70",
          count: data.highScoreCount || 0,
          filter: "high-score-leads",
        },
        {
          name: "Recent Interactions",
          description: "Leads from last 7 days",
          count: data.recentCount || 0,
          filter: "recent-leads",
        },
        {
          name: "No Meeting Booked",
          description: "Leads without consultations",
          count: data.noMeetingCount || 0,
          filter: "no-meeting-leads",
        },
        {
          name: "All Active Leads",
          description: "All leads in system",
          count: data.totalCount || 0,
          filter: "all-leads",
        },
      ])
    } catch (error) {
      console.error("Failed to fetch segments:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCampaigns(), fetchSegments()])
      setLoading(false)
    }
    loadData()
  }, [])

  const sendCampaign = async (segment: string, campaignName: string) => {
    setSending(segment)
    try {
      const response = await fetch("/api/admin/email-campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSegment: segment,
          campaignName,
          template: "lead-followup",
        }),
      })

      if (response.ok) {
        await fetchCampaigns()
        alert("Campaign sent successfully!")
      } else {
        alert("Failed to send campaign")
      }
    } catch (error) {
      console.error("Failed to send campaign:", error)
      alert("Failed to send campaign")
    } finally {
      setSending(null)
    }
  }

  const createCampaign = async () => {
    try {
      const response = await fetch("/api/admin/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaign.name,
          subject: newCampaign.subject,
          template: newCampaign.template,
          targetSegment: newCampaign.targetSegment,
          sentCount: segments.find((s) => s.filter === newCampaign.targetSegment)?.count || 0,
        }),
      })

      if (response.ok) {
        await fetchCampaigns()
        setNewCampaign({
          name: "",
          subject: "",
          template: "lead-followup",
          targetSegment: "high-score-leads",
        })
      }
    } catch (error) {
      console.error("Failed to create campaign:", error)
    }
  }

  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sent_count, 0)
  const recentCampaigns = campaigns.filter(
    (c) => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Campaign Manager</h2>
          <p className="text-muted-foreground">Automate lead follow-ups and nurturing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => Promise.all([fetchCampaigns(), fetchSegments()])} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Email Campaign</DialogTitle>
                <DialogDescription>Set up a new email campaign for lead nurturing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="e.g., Weekly Follow-up"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Subject</label>
                  <Input
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    placeholder="e.g., Let's explore AI opportunities for your business"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Segment</label>
                  <Select
                    value={newCampaign.targetSegment}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, targetSegment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((segment) => (
                        <SelectItem key={segment.filter} value={segment.filter}>
                          {segment.name} ({segment.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createCampaign} className="w-full">
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">{recentCampaigns} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">Lead segments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Segment Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {segments.length > 0 ? Math.round(segments.reduce((sum, s) => sum + s.count, 0) / segments.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Leads per segment</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Send Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Send Campaigns</CardTitle>
          <CardDescription>Send immediate follow-up campaigns to lead segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {segments.map((segment) => (
              <div key={segment.filter} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{segment.name}</h4>
                    <p className="text-sm text-muted-foreground">{segment.description}</p>
                  </div>
                  <Badge variant="outline">{segment.count} leads</Badge>
                </div>
                <Button
                  onClick={() => sendCampaign(segment.filter, `Quick ${segment.name} Campaign`)}
                  disabled={sending === segment.filter || segment.count === 0}
                  className="w-full"
                  size="sm"
                >
                  {sending === segment.filter ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Send Follow-up
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign History */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>Recent email campaigns and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns sent yet. Create your first campaign above!
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant="outline" className="capitalize">
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{campaign.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sent {new Date(campaign.created_at).toLocaleDateString()} • Target:{" "}
                      {campaign.target_segment.replace("-", " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">{campaign.sent_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">emails sent</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Templates Info */}
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>Email Templates Available:</strong> Lead Follow-up (personalized with AI capabilities), Meeting
          Confirmation (with calendar details), Meeting Reminder (24h before). All emails use professional F.B/c AI
          branding and are mobile-responsive.
        </AlertDescription>
      </Alert>
    </div>
  )
}
