"use client"

import type React from "react"

import { useChat } from "@/hooks/chat/useChat"
import { useToast } from "@/components/ui/use-toast"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import type { LeadCaptureState } from "../types/lead-capture"
import {
  handleROICalculation as handleROICalculationService,
  handleVideoAppResult as handleVideoAppResultService,
  handleScreenShare as handleScreenShareService,
  handleVoiceTranscript as handleVoiceTranscriptService,
  handleWebcamCapture as handleWebcamCaptureService,
} from "@/lib/services/tool-service"
import type { ROICalculationResult, VideoAppResult } from "@/lib/services/tool-service"
import { useCallback, useRef } from "react"

interface UseChatControllerProps {
  sessionId: string | null
  leadCaptureState: LeadCaptureState
}

const SUBMIT_COOLDOWN = 2000 // 2 seconds

export const useChatController = ({ sessionId, leadCaptureState }: UseChatControllerProps) => {
  const { addActivity } = useChatContext()
  const { toast } = useToast()
  const lastSubmitTimeRef = useRef<number>(0)

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
    append,
    clearMessages,
  } = useChat({
    data: {
      leadContext: leadCaptureState.leadData,
      sessionId: sessionId || "anonymous",
      userId: "anonymous_user",
    },
    onFinish: (message) => {
      addActivity({
        type: "ai_stream",
        title: "AI Response Generated",
        description: `Response completed: ${message.content.substring(0, 100)}...`,
        status: "completed",
      })
    },
    onError: (err) => {
      toast({ title: "Chat Error", description: err.message, variant: "destructive" })
      addActivity({
        type: "ai_stream",
        title: "Chat Incomplete",
        description: "Chat response could not be completed",
        status: "completed",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastSubmitTimeRef.current < SUBMIT_COOLDOWN) {
      toast({
        title: "Please wait",
        description: "You're sending messages too quickly.",
        variant: "destructive",
      })
      return
    }
    lastSubmitTimeRef.current = now

    if (leadCaptureState.stage === "collecting_info") {
      toast({
        title: "Please complete the form first",
        description: "We need your details to start the AI consultation.",
        variant: "destructive",
      })
      return
    }
    if (input.trim()) {
      originalHandleSubmit(e)
      addActivity({
        type: "user_action",
        title: "User Message Sent",
        description: input.substring(0, 100),
        status: "completed",
      })
    }
  }

  const handleImageUpload = useCallback(
    (imageData: string, fileName: string) => {
      append({
        role: "user",
        content: `[Image uploaded: ${fileName}] Please analyze this image.`,
        imageUrl: imageData,
      })
      addActivity({ type: "image_upload", title: "Image Uploaded", description: fileName, status: "completed" })
    },
    [append, addActivity],
  )

  const handleFileUpload = useCallback(
    async (file: File) => {
      addActivity({
        type: "file_upload",
        title: "File Upload Started",
        description: `Uploading ${file.name}`,
        status: "in_progress",
      })
      try {
        const formData = new FormData()
        formData.append("file", file)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "x-demo-session-id": sessionId || "anonymous",
            "x-user-id": "anonymous_user",
          },
          body: formData,
        })
        if (!uploadResponse.ok) throw new Error("Upload failed")
        append({ role: "user", content: `[File uploaded: ${file.name}] Please analyze this document.` })
        addActivity({ type: "file_upload", title: "File Uploaded", description: file.name, status: "completed" })
      } catch (error) {
        console.error("File upload error:", error)
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload file",
          variant: "destructive",
        })
        addActivity({
          type: "file_upload",
          title: "Upload Incomplete",
          description: `Could not upload ${file.name}`,
          status: "completed",
        })
      }
    },
    [append, addActivity, sessionId, toast],
  )

  const handleVoiceTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return
      try {
        await handleVoiceTranscriptService({ transcript })
        append({ role: "user", content: transcript })
        addActivity({
          type: "voice_input",
          title: "Voice Input Sent",
          description: transcript.substring(0, 100),
          status: "completed",
        })
      } catch (error) {
        console.error("Voice transcript error:", error)
        append({
          role: "assistant",
          content: "I heard your voice input but couldn't process it properly. Please try typing your message instead.",
        })
      }
    },
    [append, addActivity],
  )

  const handleWebcamCapture = useCallback(
    async (imageData: string) => {
      try {
        await handleWebcamCaptureService({ imageData })
        append({
          role: "user",
          content: "[Webcam image captured] Please analyze this image.",
          imageUrl: imageData,
        })
        addActivity({
          type: "image_capture",
          title: "Webcam Photo Captured",
          description: "Webcam image captured",
          status: "completed",
        })
      } catch (error) {
        console.error("Webcam capture error:", error)
      }
    },
    [append, addActivity],
  )

  const handleScreenShareAnalysis = useCallback(
    async (analysis: string) => {
      try {
        await handleScreenShareService({ analysis })
        append({ role: "assistant", content: `**Screen Analysis:**\n${analysis}` })
        addActivity({
          type: "vision_analysis",
          title: "Screen Analyzed",
          description: "Screen content analyzed",
          status: "completed",
        })
      } catch (error) {
        console.error("Screen share error:", error)
      }
    },
    [append, addActivity],
  )

  const handleROICalculation = useCallback(
    async (result: ROICalculationResult) => {
      try {
        await handleROICalculationService(result)
        append({
          role: "assistant",
          content: `**ROI Calculation Complete:**\n\nBased on your inputs, here's your ROI analysis:\n\n- **Company Size**: ${result.companySize}\n- **Industry**: ${result.industry}\n- **Use Case**: ${result.useCase}\n- **Estimated ROI**: ${result.estimatedROI}%\n- **Time Savings**: ${result.timeSavings} hours/week\n- **Cost Savings**: $${result.costSavings}/month\n- **Payback Period**: ${result.paybackPeriod} months`,
        })
        addActivity({
          type: "tool_used",
          title: "ROI Calculator Used",
          description: "ROI calculation completed",
          status: "completed",
        })
      } catch (error) {
        console.error("ROI calculation error:", error)
      }
    },
    [append, addActivity],
  )

  const handleVideoAppResult = useCallback(
    async (result: VideoAppResult) => {
      try {
        await handleVideoAppResultService(result)
        append({
          role: "assistant",
          content: `**Video Analysis Complete:**\n\n**Title**: ${result.title}\n**Summary**: ${result.summary}\n\n**Specification**:\n${result.spec}\n\n**Generated Code**:\n\`\`\`\n${result.code}\n\`\`\``,
        })
        addActivity({
          type: "tool_used",
          title: "Video Analysis Used",
          description: "Video analysis completed",
          status: "completed",
        })
      } catch (error) {
        console.error("Video app error:", error)
      }
    },
    [append, addActivity],
  )

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    clearMessages,
    append,
    handleImageUpload,
    handleFileUpload,
    handleVoiceTranscript,
    handleWebcamCapture,
    handleScreenShareAnalysis,
    handleROICalculation,
    handleVideoAppResult,
  }
}
