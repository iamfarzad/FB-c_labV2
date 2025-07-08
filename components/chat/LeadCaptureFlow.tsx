"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserCheck, Shield, Sparkles, ArrowRight } from "lucide-react"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import type { LeadCaptureState, TCAcceptance } from "@/app/chat/types/lead-capture"

interface LeadCaptureFlowProps {
  isVisible: boolean
  onComplete: (leadData: LeadCaptureState["leadData"]) => void
  engagementType: "chat" | "voice" | "screen_share" | "webcam"
  initialQuery?: string
}

export function LeadCaptureFlow({ isVisible, onComplete, engagementType, initialQuery }: LeadCaptureFlowProps) {
  const { addActivity } = useChatContext()
  const [leadState, setLeadState] = useState<LeadCaptureState>({
    stage: "collecting_info",
    hasName: false,
    hasEmail: false,
    hasAgreedToTC: false,
    leadData: {
      engagementType,
      initialQuery,
    },
  })

  const [showTCModal, setShowTCModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) return

    setLeadState((prev) => ({
      ...prev,
      hasName: true,
      hasEmail: true,
      leadData: {
        ...prev.leadData,
        name: formData.name,
        email: formData.email,
        company: formData.company,
      },
    }))

    addActivity({
      type: "user_action",
      title: "Lead Information Captured",
      description: `${formData.name} (${formData.email}) provided contact details`,
      status: "completed",
    })

    // Show Terms & Conditions
    setShowTCModal(true)
  }

  const handleTCAcceptance = async (accepted: boolean) => {
    if (!accepted) {
      setShowTCModal(false)
      return
    }

    const tcAcceptance: TCAcceptance = {
      accepted: true,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    }

    setLeadState((prev) => ({
      ...prev,
      hasAgreedToTC: true,
      stage: "research",
    }))

    addActivity({
      type: "system_message",
      title: "Terms & Conditions Accepted",
      description: "Legal consent obtained for AI consultation",
      status: "completed",
    })

    setShowTCModal(false)

    // Save to Supabase with TC acceptance
    await fetch("/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...leadState.leadData,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        tcAcceptance,
        engagementType,
        initialQuery,
      }),
    })

    // Complete the flow
    onComplete({
      ...leadState.leadData,
      name: formData.name,
      email: formData.email,
      company: formData.company,
    })
  }

  if (!isVisible) return null

  return (
    <>
      {/* Lead Capture Form */}
      <Card className="mx-auto max-w-md border-2 border-orange-accent/20 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-accent/10 rounded-full flex items-center justify-center mb-2">
            <UserCheck className="w-6 h-6 text-orange-accent" />
          </div>
          <CardTitle className="text-xl">Welcome to F.B/c AI Assistant!</CardTitle>
          <CardDescription>
            I'm excited to help you explore AI automation for your business. Let's start with a quick introduction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
                className="bg-white/50"
              />
            </div>

            <div>
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="john@company.com"
                required
                className="bg-white/50"
              />
            </div>

            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Corp"
                className="bg-white/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2 bg-orange-accent hover:bg-orange-accent/90"
              disabled={!formData.name || !formData.email}
            >
              Continue to AI Consultation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you'll be asked to agree to our Terms & Conditions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions Modal */}
      <Dialog open={showTCModal} onOpenChange={setShowTCModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Terms & Conditions
            </DialogTitle>
            <DialogDescription>
              Please review and accept our terms to continue with your AI consultation
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4 text-sm">
              <h3 className="font-semibold">F.B Consulting AI Assistant Terms of Service</h3>

              <div>
                <h4 className="font-medium">1. Service Description</h4>
                <p className="text-muted-foreground mt-1">
                  F.B/c AI Assistant provides AI-powered business consultation, lead research, and automation
                  recommendations. This is a demonstration of AI capabilities for potential consulting engagements.
                </p>
              </div>

              <div>
                <h4 className="font-medium">2. Data Collection & Privacy</h4>
                <p className="text-muted-foreground mt-1">
                  We collect your name, email, and company information to provide personalized AI consultation. Your
                  data is stored securely and used only for consultation purposes. We may research publicly available
                  information about you and your company to provide relevant insights.
                </p>
              </div>

              <div>
                <h4 className="font-medium">3. AI-Generated Content</h4>
                <p className="text-muted-foreground mt-1">
                  Our AI assistant provides recommendations based on available data and industry knowledge. While we
                  strive for accuracy, all AI-generated insights should be verified and are not guaranteed to be
                  error-free.
                </p>
              </div>

              <div>
                <h4 className="font-medium">4. Consultation Purpose</h4>
                <p className="text-muted-foreground mt-1">
                  This AI interaction is designed to demonstrate our capabilities and identify potential consulting
                  opportunities. No formal consulting relationship is established until a separate agreement is signed.
                </p>
              </div>

              <div>
                <h4 className="font-medium">5. Contact & Follow-up</h4>
                <p className="text-muted-foreground mt-1">
                  By providing your contact information, you consent to follow-up communications about AI consulting
                  services that may benefit your business.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="accept-tc"
              onCheckedChange={(checked) => {
                if (checked) {
                  handleTCAcceptance(true)
                }
              }}
            />
            <Label htmlFor="accept-tc" className="text-sm">
              I have read and agree to the Terms & Conditions
            </Label>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => handleTCAcceptance(false)} className="flex-1">
              Decline
            </Button>
            <Button onClick={() => handleTCAcceptance(true)} className="flex-1 gap-2">
              <Sparkles className="w-4 h-4" />
              Accept & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
