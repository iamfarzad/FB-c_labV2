"use client"

import { useState, useEffect } from "react"
import type { LeadCaptureState } from "../types/lead-capture"
import type { Message } from "../types/chat"
import { useToast } from "@/components/ui/use-toast"

export const useLeadCapture = (messages: Message[], sessionId: string | null) => {
  const { toast } = useToast()
  const [leadCaptureState, setLeadCaptureState] = useState<LeadCaptureState>({
    stage: "initial",
    hasName: false,
    hasEmail: false,
    hasAgreedToTC: false,
    leadData: { engagementType: "chat" },
  })
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [isLoadingLeadData, setIsLoadingLeadData] = useState(true)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Initialize session
  useEffect(() => {
    setCurrentSessionId(sessionId)
    setIsLoadingLeadData(false)
  }, [sessionId])

  // Reset on session change
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      setLeadCaptureState({
        stage: "initial",
        hasName: false,
        hasEmail: false,
        hasAgreedToTC: false,
        leadData: { engagementType: "chat" },
      })
      setShowLeadCapture(false)
      setCurrentSessionId(sessionId)
    }
  }, [sessionId, currentSessionId])

  // Trigger lead capture flow
  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length === 1 && leadCaptureState.stage === "initial" && !isLoadingLeadData) {
      setShowLeadCapture(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        stage: "collecting_info",
        leadData: { ...prev.leadData, initialQuery: userMessages[0]?.content },
      }))
    }
  }, [messages, leadCaptureState.stage, isLoadingLeadData])

  const handleLeadCaptureComplete = (leadData: LeadCaptureState["leadData"]) => {
    setLeadCaptureState({
      stage: "consultation",
      hasName: true,
      hasEmail: true,
      hasAgreedToTC: true,
      leadData,
    } as LeadCaptureState)
    setShowLeadCapture(false)

    try {
      sessionStorage.setItem("fb_lead_data", JSON.stringify(leadData))
    } catch (error) {
      console.error("Failed to save lead data to sessionStorage:", error)
    }

    toast({ title: "Welcome!", description: `Starting consultation for ${leadData.name}.` })
  }

  const resetLeadCapture = () => {
    setLeadCaptureState({
      stage: "initial",
      hasName: false,
      hasEmail: false,
      hasAgreedToTC: false,
      leadData: { engagementType: "chat" },
    })
    setShowLeadCapture(false)
  }

  return {
    leadCaptureState,
    showLeadCapture,
    isLoadingLeadData,
    handleLeadCaptureComplete,
    resetLeadCapture,
  }
}
