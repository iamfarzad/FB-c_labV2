"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LeadCaptureTerms } from "./LeadCaptureTerms"
import type { LeadCaptureFormData } from "@/app/(chat)/chat/types/lead-capture"

interface LeadCaptureFormProps {
  isSubmitting: boolean
  onSubmit: (formData: LeadCaptureFormData) => void
}

export function LeadCaptureForm({ isSubmitting, onSubmit }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadCaptureFormData>({
    name: "",
    email: "",
    company: "",
    agreedToTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleTermsChange = (checked: boolean) => {
    setFormData({ ...formData, agreedToTerms: checked })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="input-minimal"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="input-minimal"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="Your company name"
          className="input-minimal"
          disabled={isSubmitting}
        />
      </div>

      <LeadCaptureTerms checked={formData.agreedToTerms} onCheckedChange={handleTermsChange} />

      <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Starting..." : "Start Consultation"}
      </Button>
    </form>
  )
}
