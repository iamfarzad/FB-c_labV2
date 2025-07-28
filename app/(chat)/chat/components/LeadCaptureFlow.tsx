"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus } from "lucide-react"
import type { EngagementType } from "./ChatContainer"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: any) => void
  engagementType: EngagementType
  initialQuery?: string
}

export function LeadCaptureFlow({ isVisible, onComplete, engagementType, initialQuery }: LeadCaptureFlowProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    interests: initialQuery || "",
    agreedToTerms: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreedToTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    try {
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          engagementType,
        }),
      })

      if (response.ok) {
        onComplete(formData)
      } else {
        console.error("Lead capture failed")
      }
    } catch (error) {
      console.error("Lead capture error:", error)
    }
  }

  if (!isVisible) return null

  const getTitle = () => {
    switch (engagementType) {
      case "demo":
        return "Continue Your Demo"
      case "free-trial":
        return "Start Your Free Trial"
      case "sales-call":
        return "Schedule Your Consultation"
      default:
        return "Get Started"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="john@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              placeholder="Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              placeholder="CEO, CTO, Manager..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">What interests you most?</Label>
            <Textarea
              id="interests"
              value={formData.interests}
              onChange={(e) => setFormData((prev) => ({ ...prev, interests: e.target.value }))}
              placeholder="AI automation, process optimization..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreedToTerms: checked === true }))}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the terms and conditions and privacy policy
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={!formData.agreedToTerms}>
            {engagementType === "sales-call" ? "Schedule Call" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
