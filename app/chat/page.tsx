"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@/hooks/chat/useChat"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatMain } from "@/components/chat/ChatMain"
import { ChatFooter } from "@/components/chat/ChatFooter"
import { DesktopSidebar } from "@/components/chat/sidebar/DesktopSidebar"
import { LeadCaptureFlow } from "@/components/chat/LeadCaptureFlow"
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal"
import { ScreenShareModal } from "@/components/chat/modals/ScreenShareModal"
import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { VoiceOutputModal } from "@/components/chat/modals/VoiceOutputModal"
import { WebcamModal } from "@/components/chat/modals/WebcamModal"
import { Video2AppModal } from "@/components/chat/modals/Video2AppModal"
import { LiveVoiceModal } from "@/components/chat/modals/LiveVoiceModal"
import type { LeadCaptureState } from "./types/lead-capture"
import { useChatContext } from "./context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { supabase } from "@/lib/supabase/client"
import { sampleTimelineActivities } from "@/components/chat/sidebar/sampleTimelineData"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "./types/chat"

// Disable static optimization for this page
export const dynamic = 'force-dynamic'

export default function ChatPage() {
  const [sessionId] = useState(() => uuidv4())
  const { activityLog, addActivity } = useChatContext()
  const { toast } = useToast()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showVoiceOutputModal, setShowVoiceOutputModal] = useState(false)
  const [voiceOutputData, setVoiceOutputData] = useState<{
    textContent: string
    voiceStyle?: string
  } | null>(null)
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)
  const [showVideo2AppModal, setShowVideo2AppModal] = useState(false)
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState(false)

  const [leadCaptureState, setLeadCaptureState] = useState<LeadCaptureState>({
    stage: "initial",
    hasName: false,
    hasEmail: false,
    hasAgreedToTC: false,
    leadData: { engagementType: "chat" },
  })
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  const { 
    messages, 
    input, 
    setInput, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error, 
    append, 
    clearMessages,
    sendMessage 
  } = useChat({
    data: {
      leadContext: leadCaptureState.leadData,
      sessionId: sessionId,
      userId: "anonymous_user" // Could be enhanced with real user tracking
    },
    onFinish: (message) => {
      activityLogger.log({
        type: "ai_stream",
        title: "AI Response Received",
        description: `Full response generated.`,
        status: "completed",
      })
    },
    onError: (err) => {
      toast({ title: "Chat Error", description: err.message, variant: "destructive" })
      activityLogger.log({ type: "error", title: "Chat API Error", description: err.message, status: "failed" })
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length === 1 && leadCaptureState.stage === "initial") {
      setShowLeadCapture(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        stage: "collecting_info",
        leadData: { ...prev.leadData, initialQuery: userMessages[0]?.content },
      }))
    }
  }, [messages, leadCaptureState.stage])

  useEffect(() => {
    const channel = supabase
      .channel(`activity-log-${sessionId}`)
      .on("broadcast", { event: "activity-update" }, ({ payload }) => addActivity(payload))
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [addActivity, sessionId])

  const handleNewChat = useCallback(() => {
    clearMessages()
    setLeadCaptureState({
      stage: "initial",
      hasName: false,
      hasEmail: false,
      hasAgreedToTC: false,
      leadData: { engagementType: "chat" },
    })
    setShowLeadCapture(false)
    toast({ title: "New Chat Started" })
  }, [clearMessages, toast])

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (leadCaptureState.stage === "collecting_info") {
      toast({
        title: "Please complete the form first",
        description: "We need your details to start the AI consultation.",
        variant: "destructive",
      })
      return
    }
    if (input.trim()) {
      handleSubmit(e)
      activityLogger.log({ type: "user_action", title: "User Message Sent", description: input, status: "completed" })
    }
  }

  const handleLeadCaptureComplete = (leadData: LeadCaptureState["leadData"]) => {
    setLeadCaptureState({ 
      stage: "consultation", 
      hasName: true,
      hasEmail: true,
      hasAgreedToTC: true,
      leadData 
    } as LeadCaptureState)
    setShowLeadCapture(false)
    append({
      role: "assistant",
      content: `Hello ${leadData.name}! 👋 Thanks for providing your details. I'm now ready to assist. How can I help with your AI automation goals today?`,
    })
    toast({ title: "Welcome!", description: `Starting consultation for ${leadData.name}.` })
  }

  const handleImageUpload = useCallback(
    (imageData: string, fileName: string) => {
      append({
        role: "user",
        content: `[Image uploaded: ${fileName}] Please analyze this image.`,
        imageUrl: imageData,
      })
      activityLogger.log({ type: "image_upload", title: "Image Uploaded", description: fileName, status: "completed" })
    },
    [append],
  )

  const handleFileUpload = (file: File) => {
    append({
      role: "user",
      content: `[File uploaded: ${file.name}] Please summarize or analyze this document.`,
    })
    activityLogger.log({
      type: "file_upload",
      title: "File Uploaded",
      description: file.name,
      status: "completed",
    })
  }

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      if (!transcript.trim()) return
      append({ role: "user", content: transcript })
      activityLogger.log({ type: "voice_input", title: "Voice Input Sent", description: transcript, status: "completed" })
    },
    [append],
  )

  const handleWebcamCapture = useCallback(
    (imageData: string) => {
      append({
        role: "user",
        content: "[Webcam image captured] Please analyze this image.",
        imageUrl: imageData,
      })
      activityLogger.log({ type: "image_capture", title: "Webcam Photo Captured", description: "Webcam image captured", status: "completed" })
    },
    [append],
  )

  const handleScreenShareAnalysis = useCallback(
    (analysis: string) => {
      append({
        role: "assistant",
        content: `**Screen Analysis:**\n${analysis}`,
      })
      activityLogger.log({ type: "vision_analysis", title: "Screen Analyzed", description: "Screen content analyzed", status: "completed" })
    },
    [append],
  )

  const handleVideoAppResult = useCallback(
    (result: { spec: string; code: string }) => {
      append({
        role: "assistant",
        content: `I have successfully generated a new learning app based on the video.`,
      })
      activityLogger.log({ type: "tool_used", title: "Video-to-App Generated", description: "Learning app generated from video", status: "completed" })
    },
    [append],
  )

  const handleVoiceResponse = useCallback(
    (textContent: string, voiceStyle: string = "neutral") => {
      setVoiceOutputData({ textContent, voiceStyle })
      setShowVoiceOutputModal(true)
      activityLogger.log({ 
        type: "voice_response", 
        title: "Voice Response Triggered", 
        description: `AI speaking: ${textContent.slice(0, 100)}...`, 
        status: "in_progress" 
      })
    },
    [],
  )

  const handleDownloadSummary = useCallback(() => {
    const summary = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat_summary_${sessionId}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Summary Exported" })
  }, [messages, sessionId, toast])

  const handleFocusInput = useCallback(() => inputRef.current?.focus(), [])
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), [])

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSendMessage: () => inputRef.current?.closest("form")?.requestSubmit(),
    onExportSummary: handleDownloadSummary,
    onToggleSidebar: handleToggleSidebar,
    onFocusInput: handleFocusInput,
    onOpenVoice: () => setShowVoiceModal(true),
    onOpenCamera: () => setShowWebcamModal(true),
    onOpenScreenShare: () => setShowScreenShareModal(true),
  })

  const handleActivityClick = useCallback((activity: any) => {
    console.log("Activity clicked:", activity)
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
          <ChatHeader onDownloadSummary={handleDownloadSummary} activities={activityLog} onNewChat={handleNewChat} onActivityClick={handleActivityClick} />
          <div className="flex-1 relative min-h-0">
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
            <ChatMain messages={messages as Message[]} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="shrink-0">
            <ChatFooter
              input={input}
              setInput={setInput}
              handleInputChange={handleInputChange}
              isLoading={isLoading}
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
              setShowVideo2AppModal={setShowVideo2AppModal}
              setShowLiveVoiceModal={setShowLiveVoiceModal}
            />
          </form>
        </div>
      </div>
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />

      {showScreenShareModal && (
        <ScreenShareModal
          isOpen={showScreenShareModal}
          onClose={() => setShowScreenShareModal(false)}
          onAIAnalysis={handleScreenShareAnalysis}
          onStream={() =>
            activityLogger.log({ type: "screen_share", title: "Screen Share Started", description: "Screen sharing session started", status: "in_progress" })
          }
        />
      )}
      {showVoiceModal && (
        <VoiceInputModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onTransferToChat={handleVoiceTranscript}
        />
      )}
      {showWebcamModal && (
        <WebcamModal
          isOpen={showWebcamModal}
          onClose={() => setShowWebcamModal(false)}
          onCapture={handleWebcamCapture}
          onAIAnalysis={(analysis) =>
            append({
              role: "assistant",
              content: `**Webcam Analysis:**\n${analysis}`,
            })
          }
        />
      )}
      {showVideo2AppModal && (
        <Video2AppModal
          isOpen={showVideo2AppModal}
          onClose={() => setShowVideo2AppModal(false)}
          onAnalysisComplete={handleVideoAppResult}
        />
      )}
      {showVoiceOutputModal && voiceOutputData && (
        <VoiceOutputModal
          isOpen={showVoiceOutputModal}
          onClose={() => {
            setShowVoiceOutputModal(false)
            setVoiceOutputData(null)
          }}
          textContent={voiceOutputData.textContent}
          voiceStyle={voiceOutputData.voiceStyle}
          autoPlay={true}
        />
      )}
      {showLiveVoiceModal && (
        <LiveVoiceModal
          isOpen={showLiveVoiceModal}
          onClose={() => setShowLiveVoiceModal(false)}
          leadContext={{
            name: leadCaptureState.leadData.name,
            company: leadCaptureState.leadData.company
          }}
        />
      )}
    </ChatLayout>
  )
}
