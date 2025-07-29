"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, Search, FileText, Users, Calendar, Upload, Monitor, Mic, Video } from "lucide-react"

interface ChatModalsProps {
  modals: {
    roi: boolean
    research: boolean
    analysis: boolean
    leads: boolean
    meeting: boolean
    upload: boolean
    screen: boolean
    voice: boolean
    webcam: boolean
  }
  onClose: (modal: string) => void
}

export function ChatModals({ modals, onClose }: ChatModalsProps) {
  return (
    <>
      {/* ROI Calculator Modal */}
      <Dialog open={modals.roi} onOpenChange={() => onClose("roi")}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              ROI Calculator
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Initial Investment</label>
              <Input type="number" placeholder="Enter amount" />
            </div>
            <div>
              <label className="text-sm font-medium">Current Value</label>
              <Input type="number" placeholder="Enter current value" />
            </div>
            <div>
              <label className="text-sm font-medium">Time Period (months)</label>
              <Input type="number" placeholder="Enter months" />
            </div>
            <Button className="w-full">Calculate ROI</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Research Modal */}
      <Dialog open={modals.research} onOpenChange={() => onClose("research")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Lead Research
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Company/Industry</label>
              <Input placeholder="Enter company name or industry" />
            </div>
            <div>
              <label className="text-sm font-medium">Research Criteria</label>
              <Textarea placeholder="Describe what you're looking for..." />
            </div>
            <Button className="w-full">Start Research</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analysis Modal */}
      <Dialog open={modals.analysis} onOpenChange={() => onClose("analysis")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Analysis
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop your documents here or click to upload</p>
            </div>
            <Button className="w-full">Analyze Documents</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leads Modal */}
      <Dialog open={modals.leads} onOpenChange={() => onClose("leads")}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Management
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <Badge variant="secondary">+3 this week</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18%</div>
                  <Badge variant="secondary">+2% this month</Badge>
                </CardContent>
              </Card>
            </div>
            <Button className="w-full">View All Leads</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Modal */}
      <Dialog open={modals.meeting} onOpenChange={() => onClose("meeting")}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Meeting Title</label>
              <Input placeholder="Enter meeting title" />
            </div>
            <div>
              <label className="text-sm font-medium">Date & Time</label>
              <Input type="datetime-local" />
            </div>
            <div>
              <label className="text-sm font-medium">Attendees</label>
              <Input placeholder="Enter email addresses" />
            </div>
            <Button className="w-full">Schedule Meeting</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={modals.upload} onOpenChange={() => onClose("upload")}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop files here or click to browse</p>
            </div>
            <Button className="w-full">Upload Files</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screen Share Modal */}
      <Dialog open={modals.screen} onOpenChange={() => onClose("screen")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Screen Sharing
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-8 text-center">
              <Monitor className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to start screen sharing</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Share Screen</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Share Window
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Modal */}
      <Dialog open={modals.voice} onOpenChange={() => onClose("voice")}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Input
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Mic className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">Click to start recording</p>
            </div>
            <Button className="w-full">Start Recording</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webcam Modal */}
      <Dialog open={modals.webcam} onOpenChange={() => onClose("webcam")}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Webcam Capture
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
              <Video className="h-16 w-16 text-muted-foreground" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Start Camera</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Take Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
