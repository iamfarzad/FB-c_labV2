"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Search, FileText, Users, Calendar, Upload, Monitor, Mic, Camera, Sparkles } from "lucide-react"

interface ChatModalsProps {
  activeModal: string | null
  onClose: () => void
}

export function ChatModals({ activeModal, onClose }: ChatModalsProps) {
  const getModalIcon = () => {
    switch (activeModal) {
      case "roi-calc":
        return <Calculator className="h-5 w-5" />
      case "research":
        return <Search className="h-5 w-5" />
      case "analysis":
        return <FileText className="h-5 w-5" />
      case "leads":
        return <Users className="h-5 w-5" />
      case "meeting":
        return <Calendar className="h-5 w-5" />
      case "upload":
        return <Upload className="h-5 w-5" />
      case "screen":
        return <Monitor className="h-5 w-5" />
      case "voice":
        return <Mic className="h-5 w-5" />
      case "webcam":
        return <Camera className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const renderModalContent = () => {
    switch (activeModal) {
      case "roi-calc":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>
                Calculate your return on investment with precision and get detailed insights.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investment" className="text-sm font-medium">
                  Initial Investment ($)
                </Label>
                <Input id="investment" type="number" placeholder="10,000" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returns" className="text-sm font-medium">
                  Expected Returns ($)
                </Label>
                <Input id="returns" type="number" placeholder="15,000" className="h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe" className="text-sm font-medium">
                Timeframe (months)
              </Label>
              <Input id="timeframe" type="number" placeholder="12" className="h-10" />
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">50%</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Estimated ROI</div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-10 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              Calculate Detailed ROI
            </Button>
          </div>
        )

      case "research":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>
                Research potential leads and gather comprehensive business intelligence.
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company/Industry
                </Label>
                <Input id="company" placeholder="Enter company name or industry" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="criteria" className="text-sm font-medium">
                  Research Criteria
                </Label>
                <Textarea
                  id="criteria"
                  placeholder="What specific information are you looking for?"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary">Market Analysis</Badge>
              <Badge variant="secondary">Competitor Research</Badge>
              <Badge variant="secondary">Contact Discovery</Badge>
            </div>

            <Button className="w-full h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              Start Research
            </Button>
          </div>
        )

      case "analysis":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>
                Upload and analyze your business documents with AI-powered insights.
              </DialogDescription>
            </div>

            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600">
              <CardContent className="p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Drop your documents here or click to browse
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Supports PDF, DOC, DOCX, XLS, XLSX, TXT</p>
                <Button variant="outline" className="mt-4 bg-transparent">
                  Choose Files
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <div className="font-medium">📊 Financial</div>
                <div className="text-slate-500">Reports & Statements</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <div className="font-medium">📋 Contracts</div>
                <div className="text-slate-500">Legal Documents</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <div className="font-medium">📈 Analytics</div>
                <div className="text-slate-500">Performance Data</div>
              </div>
            </div>
          </div>
        )

      case "leads":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>Manage your leads and track conversion opportunities.</DialogDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Active Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    +3 this week
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18%</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    +2% this month
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Add New Lead</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadName" className="text-sm">
                    Lead Name
                  </Label>
                  <Input id="leadName" placeholder="John Doe" className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadEmail" className="text-sm">
                    Email
                  </Label>
                  <Input id="leadEmail" type="email" placeholder="john@company.com" className="h-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadCompany" className="text-sm">
                  Company
                </Label>
                <Input id="leadCompany" placeholder="Company Name" className="h-9" />
              </div>
            </div>

            <Button className="w-full h-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              Save Lead
            </Button>
          </div>
        )

      case "meeting":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>Schedule meetings and manage your calendar efficiently.</DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meetingTitle" className="text-sm font-medium">
                  Meeting Title
                </Label>
                <Input id="meetingTitle" placeholder="Business Strategy Discussion" className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingDate" className="text-sm font-medium">
                    Date
                  </Label>
                  <Input id="meetingDate" type="date" className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingTime" className="text-sm font-medium">
                    Time
                  </Label>
                  <Input id="meetingTime" type="time" className="h-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingAttendees" className="text-sm font-medium">
                  Attendees
                </Label>
                <Input id="meetingAttendees" placeholder="email1@company.com, email2@company.com" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meetingNotes" className="text-sm font-medium">
                  Meeting Notes
                </Label>
                <Textarea id="meetingNotes" placeholder="Add agenda or notes..." className="min-h-[60px]" />
              </div>
            </div>

            <Button className="w-full h-10 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
              Schedule Meeting
            </Button>
          </div>
        )

      case "upload":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>Upload files for analysis, processing, or storage.</DialogDescription>
            </div>

            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-600">
              <CardContent className="p-12 text-center">
                <Upload className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Drop files here to upload</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">or click to browse from your device</p>
                <Button variant="outline" className="bg-transparent">
                  Browse Files
                </Button>
              </CardContent>
            </Card>

            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, CSV
            </div>
          </div>
        )

      case "screen":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center mb-4">
                <Monitor className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>Share your screen for collaboration and assistance.</DialogDescription>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <Monitor className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Click to start screen sharing session</p>
                <div className="flex gap-2 justify-center">
                  <Button className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700">
                    Share Entire Screen
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    Share Window
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "voice":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>Use voice input for hands-free interaction.</DialogDescription>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 border-4 border-red-500/30 flex items-center justify-center">
                  <Mic className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Click to start voice recording</p>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Start Recording
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case "webcam":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <DialogDescription>Use your webcam for visual input and analysis.</DialogDescription>
            </div>

            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardContent className="p-8">
                <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-16 w-16 text-slate-400" />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700">
                    Start Camera
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    Take Photo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">Tool interface coming soon...</p>
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
      case "voice":
        return "Voice Input"
      case "webcam":
        return "Webcam Capture"
      default:
        return "Business Tool"
    }
  }

  return (
    <Dialog open={!!activeModal} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            {getModalIcon()}
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>
        {renderModalContent()}
      </DialogContent>
    </Dialog>
  )
}
