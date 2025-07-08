"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, CheckCircle, User, Mail, Building } from "lucide-react"
import type { LeadCaptureState } from "@/app/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: LeadCaptureState["leadData"]) => void
  engagementType: "chat" | "voice" | "webcam" | "screen_share"
  initialQuery?: string
}

export function LeadCaptureFlow({ isVisible, onComplete, engagementType, initialQuery }: LeadCaptureFlowProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    agreedToTC: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isVisible) return null

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step === 1 && formData.name.trim()) {
      setStep(2)
    } else if (step === 2 && formData.email.trim() && formData.email.includes("@")) {
      setStep(3)
    }
  }

  const handleComplete = async () => {
    if (!formData.agreedToTC) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const leadData: LeadCaptureState["leadData"] = {
      name: formData.name,
      email: formData.email,
      company: formData.company || undefined,
      engagementType,
      initialQuery,
      agreedToTC: true,
      capturedAt: new Date().toISOString(),
    }

    onComplete(leadData)
    setIsSubmitting(false)
  }

  const getEngagementBadge = () => {
    const badges = {
      chat: { label: "Chat", color: "bg-blue-500" },
      voice: { label: "Voice", color: "bg-green-500" },
      webcam: { label: "Video", color: "bg-purple-500" },
      screen_share: { label: "Screen Share", color: "bg-orange-500" },
    }
    const badge = badges[engagementType]
    return <Badge className={`${badge.color} text-white`}>{badge.label} Session</Badge>
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-xl border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Welcome to F.B/c AI</h2>
          </div>
          <div className="flex items-center justify-center gap-2">
            {getEngagementBadge()}
            <Badge variant="outline">Step {step} of 3</Badge>
          </div>
          <CardDescription>Let's personalize your AI automation consultation experience</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>What should we call you?</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleNext()}
                  autoFocus
                />
              </div>
              <Button onClick={handleNext} disabled={!formData.name.trim()} className="w-full">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>How can we reach you?</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleNext()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!formData.email.trim() || !formData.email.includes("@")}
                  className="flex-1"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="w-4 h-4" />
                <span>Tell us about your business (optional)</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Your company (optional)"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTC}
                    onCheckedChange={(checked) => handleInputChange("agreedToTC", checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the consultation terms
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I consent to receive personalized AI automation insights and agree to F.B/c's consultation terms.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={!formData.agreedToTC || isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    "Starting..."
                  ) : (
                    <>
                      Start Consultation <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {initialQuery && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Your initial question:</p>
              <p className="text-sm italic">"{initialQuery.substring(0, 100)}..."</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
