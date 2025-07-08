"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle, User, Building, MessageSquare } from "lucide-react"
import type { LeadCaptureState } from "@/app/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: LeadCaptureState["leadData"]) => void
  engagementType?: "chat" | "voice" | "webcam" | "screen_share"
  initialQuery?: string
}

export function LeadCaptureFlow({
  isVisible,
  onComplete,
  engagementType = "chat",
  initialQuery,
}: LeadCaptureFlowProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    industry: "",
    challenges: "",
    agreedToTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required"
      if (!formData.email.trim()) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email"
    }

    if (currentStep === 3) {
      if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the terms to continue"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleComplete = () => {
    if (validateStep(step)) {
      onComplete({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        role: formData.role,
        industry: formData.industry,
        challenges: formData.challenges,
        engagementType,
        initialQuery,
        agreedToTerms: formData.agreedToTerms,
      })
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!isVisible) return null

  const getEngagementIcon = () => {
    switch (engagementType) {
      case "voice":
        return "🎤"
      case "webcam":
        return "📹"
      case "screen_share":
        return "🖥️"
      default:
        return "💬"
    }
  }

  const getEngagementLabel = () => {
    switch (engagementType) {
      case "voice":
        return "Voice Consultation"
      case "webcam":
        return "Video Consultation"
      case "screen_share":
        return "Screen Share Session"
      default:
        return "Chat Consultation"
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">{getEngagementIcon()}</span>
          </div>
          <CardTitle>Welcome to F.B/c AI</CardTitle>
          <CardDescription>Let's personalize your {getEngagementLabel().toLowerCase()} experience</CardDescription>
          <Badge variant="secondary" className="mx-auto">
            {getEngagementLabel()}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  Tell us about yourself
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This helps us provide personalized AI automation insights
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="Enter your email address"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  Your Business Context
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Help us understand your industry and challenges</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => updateFormData("company", e.target.value)}
                    placeholder="Your company name (optional)"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => updateFormData("role", e.target.value)}
                    placeholder="e.g., CEO, Marketing Manager, Developer"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => updateFormData("industry", e.target.value)}
                    placeholder="e.g., E-commerce, Healthcare, SaaS"
                  />
                </div>

                <div>
                  <Label htmlFor="challenges">Current Challenges</Label>
                  <Textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => updateFormData("challenges", e.target.value)}
                    placeholder="What business processes would you like to automate?"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Agreement */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ready to Start
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Review your information and agree to our terms</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{formData.email}</span>
                </div>
                {formData.company && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Company:</span>
                    <span className="text-sm">{formData.company}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Session Type:</span>
                  <span className="text-sm">{getEngagementLabel()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => updateFormData("agreedToTerms", checked as boolean)}
                    className={errors.agreedToTerms ? "border-destructive" : ""}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to receive personalized AI automation insights and understand that this consultation is for
                    informational purposes. I consent to the processing of my information for this session.
                  </Label>
                </div>
                {errors.agreedToTerms && <p className="text-sm text-destructive">{errors.agreedToTerms}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button onClick={handleNext} className="flex-1">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1">
                Start Consultation
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
