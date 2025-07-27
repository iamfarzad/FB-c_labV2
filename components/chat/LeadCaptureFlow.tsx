"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import type { LeadCaptureState } from "@/app/(chat)/chat/types/lead-capture"

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
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    agreedToTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.agreedToTerms) {
      toast({
        title: "Please fill in all required fields",
        description: "Name, email, and terms agreement are required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Submit lead data to backend
      const response = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          engagementType,
          initialQuery,
          tcAcceptance: {
            accepted: formData.agreedToTerms,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error Response:', errorData)
        throw new Error(`Failed to submit lead data: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Lead capture success:', result)

      // Complete the flow
      onComplete({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
      })

      toast({
        title: "Welcome!",
        description: "Your information has been saved. Let's start the consultation.",
      })
    } catch (error) {
      console.error("Lead capture error:", error)
      
      // If API fails, still allow the user to continue with the chat
      // Store the data locally for later sync
      const fallbackData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
        timestamp: new Date().toISOString(),
        fallback: true
      }
      localStorage.setItem('pendingLeadData', JSON.stringify(fallbackData))
      
      // Still complete the flow so user can continue
      onComplete({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
      })

      toast({
        title: "Welcome!",
        description: "Starting your consultation. Your information will be saved shortly.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="card-minimal w-full max-w-md mx-auto">
      <div className="pb-3">
        <h2 className="text-2xl font-semibold text-foreground">Welcome to F.B/c AI</h2>
        <p className="text-muted-foreground">Please provide your details to start your AI consultation</p>
      </div>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              className="input-minimal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="input-minimal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Your company name"
              className="input-minimal"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreedToTerms: !!checked })}
            />
            <Label htmlFor="terms" className="text-sm text-foreground">
              I agree to the terms and conditions and privacy policy *
            </Label>
          </div>

          <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : "Start Consultation"}
          </Button>
        </form>
      </div>
    </div>
  )
}
