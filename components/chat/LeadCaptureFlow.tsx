"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, CheckCircle } from "lucide-react"
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    agreedToTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const leadData: LeadCaptureState["leadData"] = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      engagementType,
      initialQuery,
    }

    onComplete(leadData)
    setIsSubmitting(false)
  }

  const isFormValid = () => {
    return (
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.company.trim().length > 0 &&
      formData.agreedToTerms
    )
  }

  if (!isVisible) return null

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border shadow-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl">Welcome to F.B/c AI</CardTitle>
          <CardDescription>Please provide your details to start the consultation</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Your company name"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to receive AI consultation and understand that my information will be used to provide personalized
              recommendations.
            </Label>
          </div>

          <Button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Starting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Start Consultation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
