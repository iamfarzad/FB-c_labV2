"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building, Briefcase, Target, Send, Loader, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import type { LeadCaptureData } from "@/app/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: LeadCaptureData) => void
  onClose?: () => void
  engagementType?: string
  initialQuery?: string
}

export function LeadCaptureFlow({
  isVisible,
  onComplete,
  onClose,
  engagementType = "chat",
  initialQuery,
}: LeadCaptureFlowProps) {
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
        name: formData.name,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        interests: formData.interests,
        challenges: formData.challenges,
        engagementType,
        initialQuery,
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

      addActivity({
        type: "lead_capture",
        title: "Lead Captured Successfully",
        description: `Welcome ${formData.name}! Your information has been saved.`,
        status: "completed",
      })

      toast({
        title: "Thank You!",
        description: "Your information has been saved. Let's start your consultation!",
      })

      onComplete(leadData)
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
  }, [formData, engagementType, initialQuery, validateForm, addActivity, toast, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-auto shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                Welcome to F.B/c AI
              </CardTitle>
              <CardDescription className="text-base">Let's personalize your AI consultation experience</CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="secondary" className="text-sm">
              Step 1 of 1
            </Badge>
            <Badge variant="outline" className="text-sm">
              100% Complete
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name *
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4 text-muted-foreground" />
                Company
              </Label>
              <Input
                id="company"
                placeholder="Acme Corp"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Your Role
              </Label>
              <Input
                id="role"
                placeholder="CEO, CTO, Manager..."
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                disabled={isSubmitting}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests" className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-muted-foreground" />
              AI Interests & Goals
            </Label>
            <Input
              id="interests"
              placeholder="Automation, chatbots, data analysis, workflow optimization..."
              value={formData.interests}
              onChange={(e) => handleInputChange("interests", e.target.value)}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges" className="text-sm font-medium">
              Current Business Challenges (Optional)
            </Label>
            <Textarea
              id="challenges"
              placeholder="What business processes would you like to automate or improve? Any specific pain points we should address?"
              value={formData.challenges}
              onChange={(e) => handleInputChange("challenges", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={formData.tcAcceptance}
                onCheckedChange={(checked) => handleInputChange("tcAcceptance", checked as boolean)}
                disabled={isSubmitting}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to receive personalized AI consultation and understand that F.B/c will use my information to
                provide relevant business automation recommendations. I can unsubscribe at any time. *
              </Label>
            </div>

            <div className="text-xs text-muted-foreground bg-background/50 p-3 rounded border">
              <strong>Privacy Notice:</strong> Your privacy is important to us. We'll only use your information to
              provide personalized AI recommendations and won't share it with third parties.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onClose && (
              <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="h-11 bg-transparent">
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 h-11 flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Starting Consultation...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Start AI Consultation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
