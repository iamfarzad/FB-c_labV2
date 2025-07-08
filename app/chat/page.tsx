"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatMain } from "@/components/chat/ChatMain"
import { ChatFooter } from "@/components/chat/ChatFooter"
import { DesktopSidebar } from "@/components/chat/sidebar/DesktopSidebar"
import { LeadCaptureFlow } from "@/components/chat/LeadCaptureFlow"
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal"
import type { Message, ActivityItem } from "./types/chat"
import type { LeadCaptureState } from "./types/lead-capture"
import { useChatContext } from "./context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { supabase } from "@/lib/supabase/client"
import { sampleTimelineActivities } from "@/components/chat/sidebar/sampleTimelineData"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Lead capture state
  const [leadCaptureState, setLeadCaptureState] = useState<LeadCaptureState>({
    stage: "initial",
    hasName: false,
    hasEmail: false,
    hasAgreedToTC: false,
    leadData: {
      engagementType: "chat",
    },
  })
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Use the chat context
  const { activityLog, addActivity, clearActivities } = useChatContext()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  // Sync activity logger with context
  useEffect(() => {
    const handleActivityUpdate = (activity: ActivityItem) => {
      addActivity(activity)
    }

    activityLogger.addListener(handleActivityUpdate)
    return () => {
      activityLogger.removeListener(handleActivityUpdate)
    }
  }, [addActivity])

  // Trigger lead capture after first interaction
  useEffect(() => {
    if (messages.length === 1 && leadCaptureState.stage === "initial") {
      setShowLeadCapture(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        stage: "collecting_info",
        leadData: {
          ...prev.leadData,
          initialQuery: messages[0]?.content,
        },
      }))
    }
  }, [messages.length, leadCaptureState.stage])

  // Listen for real-time updates from Supabase
  useEffect(() => {
    const channel = supabase.channel(`ai-showcase-${sessionId}`)

    channel
      .on("broadcast", { event: "ai-response" }, ({ payload }) => {
        try {
          const newMessage: Message = {
            ...payload,
            timestamp: new Date(payload.timestamp),
          }
          setMessages((prev) => [...prev, newMessage])
          setIsLoading(false)
        } catch (error) {
          console.error("Error processing AI response:", error)
          setIsLoading(false)
        }
      })
      .on("broadcast", { event: "sidebar-update" }, ({ payload }) => {
        addActivity(payload)
      })
      .on("broadcast", { event: "activity-update" }, ({ payload }) => {
        addActivity(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addActivity, sessionId])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setLeadCaptureState({
      stage: "initial",
      hasName: false,
      hasEmail: false,
      hasAgreedToTC: false,
      leadData: {
        engagementType: "chat",
      },
    })
    setShowLeadCapture(false)
    clearActivities()
    activityLogger.clearActivities()
    toast({
      title: "New Chat Started",
      description: "Previous conversation cleared",
    })
  }, [toast, clearActivities])

  const handleActivityClick = (activity: ActivityItem) => {
    console.log("Activity clicked:", activity)
  }

  const handleImageUpload = useCallback(
    (imageData: string, fileName: string) => {
      // Create a message with the uploaded image
      const imageMessage: Message = {
        id: `img_${Date.now()}`,
        role: "user",
        content: `📸 Uploaded image: ${fileName}`,
        timestamp: new Date(),
        imageUrl: imageData,
      }

      setMessages((prev) => [...prev, imageMessage])

      // Log the image upload activity
      activityLogger.logActivity({
        type: "image_upload",
        title: "Image Added to Chat",
        description: `${fileName} ready for AI analysis`,
        status: "completed",
        details: [`File: ${fileName}`, "Image displayed in chat", "Ready for AI vision analysis"],
      })

      toast({
        title: "Image Uploaded",
        description: `${fileName} added to conversation`,
      })
    },
    [toast],
  )

  const handleSendMessage = useCallback(
    async (inputOverride?: string | React.KeyboardEvent) => {
      // Handle different input types
      let inputToUse: string

      if (typeof inputOverride === "string") {
        inputToUse = inputOverride
      } else if (inputOverride && "target" in inputOverride) {
        // It's a keyboard event, ignore it and use current input
        inputToUse = input
      } else {
        inputToUse = input
      }

      // Ensure inputToUse is a string and validate
      if (typeof inputToUse !== "string") {
        console.error("Invalid input type:", typeof inputToUse, inputToUse)
        return
      }

      const trimmedInput = inputToUse.trim()
      if (!trimmedInput) {
        return
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: trimmedInput,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      // Log user message activity
      activityLogger.logActivity({
        type: "user_action",
        title: "User Message Sent",
        description: trimmedInput.substring(0, 80) + (trimmedInput.length > 80 ? "..." : ""),
        status: "completed",
        details: [
          `Message length: ${trimmedInput.length} characters`,
          `Timestamp: ${new Date().toISOString()}`,
          `Session: ${sessionId}`,
        ],
      })

      // Only proceed with AI response if lead capture is complete
      if (leadCaptureState.stage === "consultation") {
        try {
          // Start AI request activity
          const aiRequestId = activityLogger.startActivity("ai_request", {
            title: "Processing AI Request",
            description: "Sending message to Gemini AI",
            details: [
              `Input: ${trimmedInput.substring(0, 100)}...`,
              "Model: Gemini 2.5 Flash",
              "Mode: Streaming",
              `Session: ${sessionId}`,
            ],
          })

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: trimmedInput,
              conversationHistory: messages.map((m) => ({
                role: m.role,
                parts: [{ text: m.content }],
              })),
              leadContext: leadCaptureState.leadData,
              sessionId,
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          // Complete AI request activity
          activityLogger.completeActivity(aiRequestId, {
            title: "AI Request Completed",
            description: "Successfully connected to Gemini AI",
          })
        } catch (error) {
          console.error("Error sending message:", error)

          // Log error activity
          activityLogger.logActivity({
            type: "error",
            title: "AI Request Failed",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            status: "failed",
            details: [
              `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
              `Input: ${trimmedInput.substring(0, 100)}...`,
              `Timestamp: ${new Date().toISOString()}`,
              `Session: ${sessionId}`,
            ],
          })

          setIsLoading(false)
          toast({
            title: "Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        setIsLoading(false)
      }
    },
    [input, messages, leadCaptureState, toast, sessionId],
  )

  const handleLeadCaptureComplete = (leadData: LeadCaptureState["leadData"]) => {
    setLeadCaptureState((prev) => ({
      ...prev,
      stage: "consultation",
      leadData,
    }))
    setShowLeadCapture(false)

    // Add welcome message with personalization
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Hello ${leadData.name}! 👋

Thank you for agreeing to explore AI automation with F.B/c. I'm now analyzing your background and industry to provide personalized insights.

${leadData.company ? `I see you're with ${leadData.company}. ` : ""}Let me research your industry's specific challenges and how AI can help automate your workflows.

I'll be back with tailored recommendations in just a moment...`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, welcomeMessage])

    toast({
      title: "Welcome to F.B/c AI!",
      description: `Starting personalized consultation for ${leadData.name}`,
    })

    // Trigger background research
    activityLogger.logActivity({
      type: "search",
      title: "Lead Research Started",
      description: `Researching ${leadData.name} and industry insights`,
      status: "in_progress",
      details: [
        `Lead: ${leadData.name}`,
        `Company: ${leadData.company || "Not specified"}`,
        `Email: ${leadData.email}`,
        `Session: ${sessionId}`,
      ],
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (file: File) => {
    activityLogger.logActivity({
      type: "file_upload",
      title: "File Uploaded",
      description: file.name,
      status: "completed",
      details: [
        `File: ${file.name}`,
        `Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        `Type: ${file.type}`,
        `Session: ${sessionId}`,
      ],
    })
  }

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      // Validate transcript
      if (typeof transcript !== "string" || !transcript.trim()) {
        console.error("Invalid transcript:", transcript)
        return
      }

      // Update engagement type to voice
      setLeadCaptureState((prev) => ({
        ...prev,
        leadData: {
          ...prev.leadData,
          engagementType: "voice",
        },
      }))

      const voiceMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcript.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, voiceMessage])

      activityLogger.logActivity({
        type: "voice_input",
        title: "Voice Transcript Added",
        description: "Voice conversation transferred to chat",
        status: "completed",
        details: [
          `Transcript: ${transcript.substring(0, 100)}...`,
          "Source: Voice input modal",
          `Session: ${sessionId}`,
        ],
      })

      setTimeout(() => {
        handleSendMessage(transcript)
      }, 500)
    },
    [handleSendMessage, sessionId],
  )

  const handleDownloadSummary = useCallback(() => {
    const summary = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chat_summary.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Summary Exported",
      description: "Chat summary downloaded successfully",
    })
  }, [messages, toast])

  const handleFocusInput = useCallback(() => {
    inputRef.current?.focus()
    toast({
      title: "Input Focused",
      description: "Ready to type your message",
    })
  }, [toast])

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen)
    toast({
      title: isSidebarOpen ? "Sidebar Hidden" : "Sidebar Shown",
      description: `Activity timeline ${isSidebarOpen ? "hidden" : "visible"}`,
    })
  }, [isSidebarOpen, toast])

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSendMessage: handleSendMessage,
    onExportSummary: handleDownloadSummary,
    onToggleSidebar: handleToggleSidebar,
    onFocusInput: handleFocusInput,
    onOpenVoice: () => {
      setShowVoiceModal(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        leadData: { ...prev.leadData, engagementType: "voice" },
      }))
    },
    onOpenCamera: () => {
      setShowWebcamModal(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        leadData: { ...prev.leadData, engagementType: "webcam" },
      }))
    },
    onOpenScreenShare: () => {
      setShowScreenShareModal(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        leadData: { ...prev.leadData, engagementType: "screen_share" },
      }))
    },
  })

  // Listen for help shortcut globally
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (
        e.key === "F1" ||
        (modifier && e.key === "?" && !e.altKey && !e.shiftKey) ||
        (modifier && e.shiftKey && e.key === "/" && !e.altKey)
      ) {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  return (
    <ChatLayout>
      <div className="flex h-full">
        <DesktopSidebar
          activities={activityLog.length > 0 ? activityLog : sampleTimelineActivities}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onActivityClick={handleActivityClick}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader
            onDownloadSummary={handleDownloadSummary}
            activities={activityLog.length > 0 ? activityLog : sampleTimelineActivities}
            onNewChat={handleNewChat}
            onActivityClick={handleActivityClick}
          />
          <div className="flex-1 overflow-hidden relative">
            {/* Lead Capture Overlay */}
            {showLeadCapture && (
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <LeadCaptureFlow
                  isVisible={showLeadCapture}
                  onComplete={handleLeadCaptureComplete}
                  engagementType={leadCaptureState.leadData.engagementType}
                  initialQuery={leadCaptureState.leadData.initialQuery}
                />
              </div>
            )}

            <ChatMain messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          </div>
          <ChatFooter
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onKeyPress={handleKeyPress}
            onFileUpload={handleFileUpload}
            onImageUpload={handleImageUpload}
            onVoiceTranscript={handleVoiceTranscript}
            inputRef={inputRef}
            showVoiceModal={showVoiceModal}
            setShowVoiceModal={setShowVoiceModal}
            showWebcamModal={showWebcamModal}
            setShowWebcamModal={setShowWebcamModal}
            showScreenShareModal={showScreenShareModal}
            setShowScreenShareModal={setShowScreenShareModal}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </ChatLayout>
  )
}
