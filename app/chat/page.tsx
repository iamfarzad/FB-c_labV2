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
import type { Message } from "./types/chat"
import type { LeadCaptureState } from "./types/lead-capture"
import { useChatContext } from "./context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

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

  const [leadCaptureState, setLeadCaptureState] = useState<LeadCaptureState>({
    stage: "initial",
    hasName: false,
    hasEmail: false,
    hasAgreedToTC: false,
    leadData: { engagementType: "chat" },
  })
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { activityLog, addActivity, updateActivity, clearActivities } = useChatContext()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (messages.length === 1 && leadCaptureState.stage === "initial") {
      setShowLeadCapture(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        stage: "collecting_info",
        leadData: { ...prev.leadData, initialQuery: messages[0]?.content },
      }))
    }
  }, [messages, leadCaptureState.stage])

  useEffect(() => {
    const channel = supabase.channel(`ai-showcase-${sessionId}`)
    channel
      .on("broadcast", { event: "ai-response" }, ({ payload }) => {
        try {
          const newMessage: Message = { ...payload, timestamp: new Date(payload.timestamp) }
          setMessages((prev) => [...prev, newMessage])
        } catch (error) {
          console.error("Error processing AI response:", error)
          toast({ title: "Real-time Error", description: "Failed to receive AI response.", variant: "destructive" })
        } finally {
          setIsLoading(false)
        }
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, toast])

  const handleNewChat = useCallback(() => {
    setMessages([])
    setLeadCaptureState({
      stage: "initial",
      hasName: false,
      hasEmail: false,
      hasAgreedToTC: false,
      leadData: { engagementType: "chat" },
    })
    setShowLeadCapture(false)
    clearActivities()
    toast({ title: "New Chat Started", description: "Previous conversation cleared." })
  }, [toast, clearActivities])

  const handleImageUpload = useCallback(
    (imageData: string, fileName: string) => {
      const imageMessage: Message = {
        id: `img_${Date.now()}`,
        role: "user",
        content: `[Image: ${fileName}]`,
        timestamp: new Date(),
        imageUrl: imageData,
      }
      setMessages((prev) => [...prev, imageMessage])
      addActivity({
        type: "image_upload",
        title: "Image Added to Chat",
        description: `${fileName} ready for analysis.`,
        status: "completed",
      })
      toast({ title: "Image Uploaded", description: `${fileName} added to the conversation.` })
    },
    [addActivity, toast],
  )

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    addActivity({
      type: "user_action",
      title: "User Message Sent",
      description: trimmedInput.substring(0, 80),
      status: "completed",
    })

    if (leadCaptureState.stage !== "consultation") {
      setIsLoading(false)
      // Potentially show a message that they need to complete the lead form first
      return
    }

    const activityId = addActivity({
      type: "ai_request",
      title: "Processing AI Request",
      description: "Sending message to Gemini AI...",
      status: "in_progress",
    })

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmedInput,
          conversationHistory: messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
          leadContext: leadCaptureState.leadData,
          sessionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // The response is now handled by the Supabase listener, so we just update the activity
      updateActivity(activityId, {
        title: "AI Request Sent",
        description: "Waiting for real-time response.",
        status: "completed",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      updateActivity(activityId, {
        title: "AI Request Failed",
        description: errorMessage,
        status: "failed",
      })
      setIsLoading(false)
      toast({
        title: "Error",
        description: `Failed to get AI response: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }, [input, messages, leadCaptureState, toast, sessionId, addActivity, updateActivity])

  const handleLeadCaptureComplete = (leadData: LeadCaptureState["leadData"]) => {
    setLeadCaptureState({ ...leadCaptureState, stage: "consultation", leadData })
    setShowLeadCapture(false)
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Hello ${leadData.name}! 👋 Thanks for connecting. I'm analyzing your profile to provide personalized AI automation insights. I'll be back shortly.`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, welcomeMessage])
    toast({ title: "Welcome!", description: `Starting personalized consultation for ${leadData.name}.` })
    addActivity({
      type: "search",
      title: "Lead Research Started",
      description: `Researching ${leadData.name} for industry insights.`,
      status: "in_progress",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (file: File) => {
    addActivity({
      type: "file_upload",
      title: "File Uploaded",
      description: file.name,
      status: "completed",
    })
  }

  const handleVoiceTranscript = useCallback((transcript: string) => {
    if (!transcript.trim()) return
    setInput((prev) => prev + transcript)
  }, [])

  const handleDownloadSummary = useCallback(() => {
    // ... download logic
  }, [messages, toast])

  const handleFocusInput = useCallback(() => inputRef.current?.focus(), [])
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSendMessage: handleSendMessage,
    onExportSummary: handleDownloadSummary,
    onToggleSidebar: handleToggleSidebar,
    onFocusInput: handleFocusInput,
    onOpenVoice: () => setShowVoiceModal(true),
    onOpenCamera: () => setShowWebcamModal(true),
    onOpenScreenShare: () => setShowScreenShareModal(true),
  })

  return (
    <ChatLayout>
      <div className="flex h-full">
        <DesktopSidebar
          activities={activityLog}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onActivityClick={() => {}}
        />
        <div className="flex flex-1 flex-col h-full">
          <ChatHeader
            onDownloadSummary={handleDownloadSummary}
            activities={activityLog}
            onNewChat={handleNewChat}
            onActivityClick={() => {}}
          />
          <div className="relative flex-1 overflow-hidden">
            {showLeadCapture && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm">
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
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </ChatLayout>
  )
}
