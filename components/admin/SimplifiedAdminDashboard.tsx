"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Mail, Building, Calendar, TrendingUp, LogOut } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { useAdminErrorHandler } from "@/components/admin/AdminErrorBoundary"

interface Lead {
  id: string
  name: string
  email: string
  company_name?: string
  lead_score: number
  conversation_summary: string
  consultant_brief: string
  ai_capabilities_shown: string[]
  created_at: string
  status: "new" | "contacted" | "qualified" | "converted"
}

interface DashboardStats {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  conversionRate: number
  avgLeadScore: number
}

export function SimplifiedAdminDashboard() {
  const { user, logout } = useAdminAuth()
  const { handleError, handleAsyncError } = useAdminErrorHandler()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    avgLeadScore: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch leads
      const leadsResponse = await handleAsyncError(
        fetch('/api/admin/leads?period=30d'),
        'fetch-leads'
      )
      const leadsData = await leadsResponse.json()
      setLeads(leadsData.leads || [])

      // Fetch stats
      const statsResponse = await handleAsyncError(
        fetch('/api/admin/stats?period=30d'),
        'fetch-stats'
      )
      const statsData = await statsResponse.json()
      setStats({
        totalLeads: statsData.totalLeads || 0,
        newLeads: leadsData.leads?.filter((l: Lead) => l.status === 'new').length || 0,
        qualifiedLeads: leadsData.leads?.filter((l: Lead) => l.status === 'qualified').length || 0,
        conversionRate: statsData.conversionRate || 0,
        avgLeadScore: statsData.avgLeadScore || 0
      })
    } catch (error) {
      handleError(error as Error, 'fetch-data')
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await handleAsyncError(
        fetch(`/api/admin/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }),
        'update-lead-status'
      )
      fetchData() // Refresh data
    } catch (error) {
      handleError(error as Error, 'update-lead-status')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      new: "default",
      contacted: "secondary",
      qualified: "outline",
      converted: "default",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const filteredLeads = leads.filter(lead => 
    statusFilter === "all" || lead.status === statusFilter
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lead Management Dashboard</h1>
            <p className="text-muted-foreground">Quick overview and follow-ups</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualifiedLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgLeadScore}</div>
            </CardContent>
          </Card>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Lead summaries for follow-ups</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.slice(0, 10).map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {lead.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.company_name || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor(lead.lead_score)}`} />
                        <span className="font-medium">{lead.lead_score}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Lead Details: {lead.name}</DialogTitle>
                              <DialogDescription>
                                Conversation summary and consultant brief
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Consultant Brief</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                  {lead.consultant_brief}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Conversation Summary</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                  {lead.conversation_summary}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">AI Capabilities Shown</h4>
                                <div className="flex flex-wrap gap-1">
                                  {lead.ai_capabilities_shown.map((capability, index) => (
                                    <Badge key={index} variant="outline">
                                      {capability}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Update Status</h4>
                                <Select onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={lead.status} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
