"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Building, MessageSquare, CheckCircle, ArrowRight, Sparkles, Shield } from "lucide-react"
import type { LeadCaptureState } from "@/app/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: LeadCaptureState["leadData"]) => void
  engagementType?: string
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
    interests: "",
    agreedToTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const leadData: LeadCaptureState["leadData"] = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      role: formData.role,
      interests: formData.interests,
      engagementType,
      initialQuery,
      agreedToTerms: formData.agreedToTerms,
      capturedAt: new Date().toISOString(),
    }

    onComplete(leadData)
    setIsSubmitting(false)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0 && formData.email.trim().length > 0
      case 2:
        return formData.company.trim().length > 0
      case 3:
        return formData.agreedToTerms
      default:
        return false
    }
  }

  if (!isVisible) return null

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <CardTitle className="text-2xl">Welcome to F.B/c AI</CardTitle>
            <CardDescription className="mt-2">Let's personalize your AI consultation experience</CardDescription>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  Tell us about yourself
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll use this to provide personalized AI recommendations
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Details
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Help us understand your business context</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Your Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., CEO, CTO, Operations Manager"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="interests">Areas of Interest</Label>
                  <Textarea
                    id="interests"
                    placeholder="What AI solutions are you most interested in? (e.g., automation, chatbots, data analysis)"
                    value={formData.interests}
                    onChange={(e) => handleInputChange("interests", e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Terms and Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Almost Ready!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Just one final step to get started</p>
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium">Your Information:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Company:</strong> {formData.company}
                  </p>
                  {formData.role && (
                    <p>
                      <strong>Role:</strong> {formData.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Engagement Type Badge */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {engagementType === "voice"
                    ? "Voice Consultation"
                    : engagementType === "webcam"
                      ? "Video Consultation"
                      : engagementType === "screen_share"
                        ? "Screen Share Session"
                        : "Chat Consultation"}
                </Badge>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
                  />
                  <div className="text-sm leading-relaxed">
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to receive personalized AI consultation and understand that F.B/c will use my information
                      to provide relevant business automation recommendations. I can unsubscribe at any time.
                    </Label>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
                  <p className="flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Your privacy is important to us. We'll only use your information to provide personalized AI
                    recommendations and won't share it with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
            )}

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!isStepValid()} className="flex-1 gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid() || isSubmitting} className="flex-1 gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Start AI Consultation
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
