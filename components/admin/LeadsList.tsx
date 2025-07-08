"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Building, Mail, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
  last_interaction?: string
  engagement_type: string
  status: "new" | "contacted" | "qualified" | "converted"
}

interface LeadsListProps {
  searchTerm: string
  period: string
}

export function LeadsList({ searchTerm, period }: LeadsListProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [searchTerm, period])

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        period: period,
      })
      const response = await fetch(`/api/admin/leads?${params}`)
      const data = await response.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error("Failed to fetch leads:", error)
    } finally {
      setLoading(false)
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

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchLeads() // Refresh the list
    } catch (error) {
      console.error("Failed to update lead status:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
          <CardDescription>{leads.length} leads found • Filter by search term and time period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {lead.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {lead.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.company_name ? (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                          {lead.company_name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getScoreColor(lead.lead_score)}`} />
                        <span className="font-medium">{lead.lead_score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lead.ai_capabilities_shown.slice(0, 2).map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                        {lead.ai_capabilities_shown.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{lead.ai_capabilities_shown.length - 2}
                          </Badge>
                        )}
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
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => updateLeadStatus(lead.id, "contacted")}>
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Detail Modal would go here */}
      {selectedLead && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Lead Details: {selectedLead.name}
              <Button variant="ghost" onClick={() => setSelectedLead(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Consultant Brief</h4>
                <p className="text-sm text-muted-foreground">{selectedLead.consultant_brief}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Conversation Summary</h4>
                <p className="text-sm text-muted-foreground">{selectedLead.conversation_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
