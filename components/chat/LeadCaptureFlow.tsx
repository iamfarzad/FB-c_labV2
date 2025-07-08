"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building, Briefcase, Target, Send, Loader } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import type { LeadCaptureData } from "@/app/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (leadData: LeadCaptureData) => void
  sessionSummary?: string
}

export function LeadCaptureFlow({ isOpen, onClose, onComplete, sessionSummary }: LeadCaptureFlowProps) {
  const { toast } = useToast()
  const { addActivity } = useChatContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    interests: "",
    challenges: "",
    tcAcceptance: false,
  })

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const validateForm = useCallback(() => {
    const { name, email, tcAcceptance } = formData

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return false
    }

    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    if (!tcAcceptance) {
      toast({
        title: "Terms Acceptance Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      })
      return false
    }

    return true
  }, [formData, toast])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    addActivity({
      type: "lead_capture",
      title: "Submitting Lead Information",
      description: "Processing your contact details...",
      status: "in_progress",
    })

    try {
      const leadData: LeadCaptureData = {
        ...formData,
        sessionSummary: sessionSummary || "",
        timestamp: new Date().toISOString(),
        tcAcceptance: {
          accepted: formData.tcAcceptance,
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      }

      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit lead data")
      }

      const result = await response.json()

      addActivity({
        type: "lead_capture",
        title: "Lead Captured Successfully",
        description: `Welcome ${formData.name}! Your information has been saved.`,
        status: "completed",
      })

      toast({
        title: "Thank You!",
        description: "Your information has been saved. We'll be in touch soon!",
      })

      onComplete(leadData)
      onClose()
    } catch (error: any) {
      console.error("Lead capture error:", error)
      addActivity({
        type: "error",
        title: "Lead Capture Failed",
        description: error.message || "Failed to save your information",
        status: "failed",
      })

      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, sessionSummary, validateForm, addActivity, toast, onComplete, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Let's Connect
              </CardTitle>
              <CardDescription>Share your details to receive personalized AI automation insights</CardDescription>
            </div>
            <Badge variant="secondary">Lead Capture</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company
              </Label>
              <Input
                id="company"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Role
              </Label>
              <Input
                id="role"
                placeholder="CEO, CTO, Manager..."
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              AI Interests
            </Label>
            <Input
              id="interests"
              placeholder="Automation, chatbots, data analysis..."
              value={formData.interests}
              onChange={(e) => handleInputChange("interests", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Current Business Challenges</Label>
            <Textarea
              id="challenges"
              placeholder="What business processes would you like to automate or improve?"
              value={formData.challenges}
              onChange={(e) => handleInputChange("challenges", e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.tcAcceptance}
              onCheckedChange={(checked) => handleInputChange("tcAcceptance", checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to receive communications about AI automation solutions and accept the{" "}
              <a href="/terms" className="text-primary hover:underline">
                terms and conditions
              </a>
              *
            </Label>
          </div>

          {sessionSummary && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Session Summary</h4>
              <p className="text-sm text-muted-foreground">{sessionSummary}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit & Connect
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
