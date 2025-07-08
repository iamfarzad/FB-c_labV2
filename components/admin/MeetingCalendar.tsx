"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, User, Building, Video, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { type Meeting, MeetingScheduler } from "@/lib/meeting-scheduler"

export function MeetingCalendar() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [updateNotes, setUpdateNotes] = useState("")

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (statusFilter !== "all") filters.status = statusFilter
      if (selectedDate) filters.date = selectedDate

      const meetingsData = await MeetingScheduler.getMeetings(filters)
      setMeetings(meetingsData)
    } catch (error) {
      console.error("Failed to fetch meetings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [selectedDate, statusFilter])

  const updateMeetingStatus = async (meetingId: string, status: Meeting["status"]) => {
    try {
      const success = await MeetingScheduler.updateMeetingStatus(meetingId, status, updateNotes)
      if (success) {
        fetchMeetings()
        setSelectedMeeting(null)
        setUpdateNotes("")
      }
    } catch (error) {
      console.error("Failed to update meeting status:", error)
    }
  }

  const getStatusIcon = (status: Meeting["status"]) => {
    switch (status) {
      case "scheduled":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "no-show":
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Meeting["status"]) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "confirmed":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      case "no-show":
        return "secondary"
      default:
        return "default"
    }
  }

  const todaysMeetings = meetings.filter((meeting) => meeting.meetingDate === new Date().toISOString().split("T")[0])
  const upcomingMeetings = meetings.filter((meeting) => new Date(meeting.meetingDate) > new Date())
  const completedMeetings = meetings.filter((meeting) => meeting.status === "completed")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meeting Calendar</h2>
          <p className="text-muted-foreground">Manage consultation bookings</p>
        </div>
        <Button onClick={fetchMeetings} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysMeetings.filter((m) => m.status === "confirmed").length} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMeetings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {meetings.length > 0 ? Math.round((completedMeetings.length / meetings.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle>Meetings</CardTitle>
          <CardDescription>
            {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No meetings found for the selected criteria</div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(meeting.status)}
                        <Badge variant={getStatusColor(meeting.status)} className="capitalize">
                          {meeting.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{meeting.name}</span>
                          {meeting.company && (
                            <>
                              <Building className="w-4 h-4 text-muted-foreground ml-2" />
                              <span className="text-sm text-muted-foreground">{meeting.company}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{MeetingScheduler.formatMeetingDate(meeting.meetingDate)}</span>
                          <span>{MeetingScheduler.formatMeetingTime(meeting.meetingTime, meeting.timeZone)}</span>
                          <span>{meeting.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => window.open(meeting.meetingLink, "_blank")}>
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedMeeting(meeting)
                              setUpdateNotes(meeting.notes || "")
                            }}
                          >
                            Update
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Meeting</DialogTitle>
                            <DialogDescription>
                              Update the status and notes for {meeting.name}'s meeting
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <div className="flex gap-2 mt-2">
                                {(["scheduled", "confirmed", "completed", "cancelled", "no-show"] as const).map(
                                  (status) => (
                                    <Button
                                      key={status}
                                      size="sm"
                                      variant={meeting.status === status ? "default" : "outline"}
                                      onClick={() => updateMeetingStatus(meeting.id, status)}
                                      className="capitalize"
                                    >
                                      {status}
                                    </Button>
                                  ),
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <Textarea
                                value={updateNotes}
                                onChange={(e) => setUpdateNotes(e.target.value)}
                                placeholder="Add meeting notes..."
                                className="mt-2"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  {meeting.notes && (
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {meeting.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
