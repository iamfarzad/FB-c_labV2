"use client"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { LeadCaptureState, LeadCaptureFormData } from "@/app/(chat)/chat/types/lead-capture"
import { LeadCaptureHeader } from "./lead-capture/LeadCaptureHeader"
import { LeadCaptureForm } from "./lead-capture/LeadCaptureForm"

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: LeadCaptureFormData) => {
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
            userAgent: navigator.userAgent,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("API Error Response:", errorData)
        throw new Error(`Failed to submit lead data: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Lead capture success:", result)

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

      const fallbackData = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        engagementType,
        initialQuery,
        timestamp: new Date().toISOString(),
        fallback: true,
      }
      localStorage.setItem("pendingLeadData", JSON.stringify(fallbackData))

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
      <LeadCaptureHeader />
      <div className="space-y-4">
        <LeadCaptureForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
