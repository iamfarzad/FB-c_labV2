"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChatModalsProps {
  activeModal: string | null
  onClose: () => void
}

export function ChatModals({ activeModal, onClose }: ChatModalsProps) {
  const renderModalContent = () => {
    switch (activeModal) {
      case "roi-calc":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investment">Initial Investment</Label>
                <Input id="investment" type="number" placeholder="10000" />
              </div>
              <div>
                <Label htmlFor="returns">Expected Returns</Label>
                <Input id="returns" type="number" placeholder="15000" />
              </div>
            </div>
            <div>
              <Label htmlFor="timeframe">Timeframe (months)</Label>
              <Input id="timeframe" type="number" placeholder="12" />
            </div>
            <Button className="w-full">Calculate ROI</Button>
          </div>
        )

      case "research":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="Enter company name" />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="Enter industry" />
            </div>
            <div>
              <Label htmlFor="criteria">Research Criteria</Label>
              <Textarea id="criteria" placeholder="What would you like to research?" />
            </div>
            <Button className="w-full">Start Research</Button>
          </div>
        )

      case "analysis":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">Drop files here or click to upload</p>
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "leads":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leadName">Lead Name</Label>
                <Input id="leadName" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="leadEmail">Email</Label>
                <Input id="leadEmail" type="email" placeholder="john@company.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="leadCompany">Company</Label>
              <Input id="leadCompany" placeholder="Company Name" />
            </div>
            <div>
              <Label htmlFor="leadNotes">Notes</Label>
              <Textarea id="leadNotes" placeholder="Additional information..." />
            </div>
            <Button className="w-full">Save Lead</Button>
          </div>
        )

      case "meeting":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="meetingTitle">Meeting Title</Label>
              <Input id="meetingTitle" placeholder="Business Discussion" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingDate">Date</Label>
                <Input id="meetingDate" type="date" />
              </div>
              <div>
                <Label htmlFor="meetingTime">Time</Label>
                <Input id="meetingTime" type="time" />
              </div>
            </div>
            <div>
              <Label htmlFor="meetingAttendees">Attendees</Label>
              <Input id="meetingAttendees" placeholder="email1@company.com, email2@company.com" />
            </div>
            <Button className="w-full">Schedule Meeting</Button>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Tool interface coming soon...</p>
          </div>
        )
    }
  }

  const getModalTitle = () => {
    switch (activeModal) {
      case "roi-calc":
        return "ROI Calculator"
      case "research":
        return "Lead Research"
      case "analysis":
        return "Document Analysis"
      case "leads":
        return "Lead Management"
      case "meeting":
        return "Schedule Meeting"
      case "upload":
        return "File Upload"
      case "screen":
        return "Screen Share"
      default:
        return "Tool"
    }
  }

  return (
    <Dialog open={!!activeModal} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  )
}
