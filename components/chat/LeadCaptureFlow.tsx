"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Check, Mic, Camera, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
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
  initialQuery = "",
}: LeadCaptureFlowProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<LeadCaptureState["leadData"]>({
    name: "",
    email: "",
    company: "",
    role: "",
    industry: "",
    interests: [],
    engagementType: engagementType || "chat",
    initialQuery: initialQuery || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  if (!isVisible) return null

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name) newErrors.name = "Name is required"
      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email"
      }
    }

    if (step === 3 && !agreedToTerms) {
      newErrors.terms = "You must agree to the terms to continue"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1)
      } else {
        onComplete(formData)
      }
    }
  }

  const getEngagementIcon = () => {
    switch (formData.engagementType) {
      case "voice":
        return <Mic className="w-5 h-5" />
      case "webcam":
        return <Camera className="w-5 h-5" />
      case "screen_share":
        return <Monitor className="w-5 h-5" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getEngagementIcon()}
          {step === 1 && "Welcome to F.B/c AI"}
          {step === 2 && "Tell us about yourself"}
          {step === 3 && "Almost there!"}
        </CardTitle>
        <CardDescription>
          {step === 1 && "Let's get to know you better to personalize your experience"}
          {step === 2 && "Help us tailor our AI consultation to your needs"}
          {step === 3 && "Review your information and agree to our terms"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Your Role</Label>
              <Input
                id="role"
                placeholder="e.g. Marketing Manager, Developer, etc."
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g. Technology, Healthcare, etc."
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">What are you interested in?</Label>
              <Textarea
                id="interests"
                placeholder="Tell us what you're looking to achieve with AI"
                value={formData.interests.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    interests: e.target.value.split(",").map((item) => item.trim()),
                  })
                }
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
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
              {formData.role && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <span className="text-sm">{formData.role}</span>
                </div>
              )}
              {formData.industry && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Industry:</span>
                  <span className="text-sm">{formData.industry}</span>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className={cn(errors.terms ? "border-destructive" : "")}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    errors.terms ? "text-destructive" : "",
                  )}
                >
                  I agree to the Terms of Service and Privacy Policy
                </label>
                <p className="text-sm text-muted-foreground">
                  By continuing, you agree to receive communications from F.B/c.
                </p>
                {errors.terms && <p className="text-destructive text-sm">{errors.terms}</p>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <Button onClick={handleNext} className="gap-1">
          {step < 3 ? (
            <>
              Next <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Start Consultation <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
