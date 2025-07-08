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
  engagementType?: string
  initialQuery?: string
}

export function LeadCaptureFlow({
  isVisible,
  onComplete,
  engagementType = "chat",
  initialQuery,
}: LeadCaptureFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    industry: "",
    challenges: "",
    agreedToTerms: false,
  })

  const steps = [
    {
      title: "Welcome to F.B/c AI",
      description: "Let's personalize your experience",
      icon: User,
    },
    {
      title: "Tell us about yourself",
      description: "Basic information to get started",
      icon: Building,
    },
    {
      title: "Your business context",
      description: "Help us understand your needs",
      icon: MessageSquare,
    },
    {
      title: "Ready to begin!",
      description: "Start your AI consultation",
      icon: CheckCircle,
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
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

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true
      case 1:
        return formData.name.trim() && formData.email.trim()
      case 2:
        return formData.company.trim() || formData.industry.trim()
      case 3:
        return formData.agreedToTerms
      default:
        return false
    }
  }

  if (!isVisible) return null

  const currentStepIcon = steps[currentStep].icon
  const currentStepTitle = steps[currentStep].title
  const currentStepDescription = steps[currentStep].description

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            {currentStepIcon && <currentStepIcon className="w-5 h-5 text-primary-foreground" />}
          </div>
          <Badge variant="outline">{engagementType}</Badge>
        </div>
        <CardTitle>{currentStepTitle}</CardTitle>
        <CardDescription>{currentStepDescription}</CardDescription>

        {/* Progress indicator */}
        <div className="flex gap-2 justify-center mt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index <= currentStep ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentStep === 0 && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Welcome! I'm your AI automation consultant. To provide the most relevant insights, I'd like to learn a bit
              about you and your business.
            </p>
            {initialQuery && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Your question:</strong> "{initialQuery}"
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g., CEO, Marketing Manager, Developer"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., E-commerce, Healthcare, Finance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenges">Current Challenges (Optional)</Label>
              <Textarea
                id="challenges"
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                placeholder="What business challenges are you looking to solve with AI?"
                rows={3}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-muted-foreground">
                Perfect! I now have everything I need to provide personalized AI automation insights.
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: checked as boolean })}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to receive personalized AI consultation and understand that my information will be used to
                provide relevant business automation insights.
              </Label>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!canProceed()} className="flex-1">
              Start Consultation
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
