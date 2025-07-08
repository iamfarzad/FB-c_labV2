"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "ai/react"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { ChatMain } from "@/components/chat/ChatMain"
import { ChatFooter } from "@/components/chat/ChatFooter"
import { DesktopSidebar } from "@/components/chat/sidebar/DesktopSidebar"
import { LeadCaptureFlow } from "@/components/chat/LeadCaptureFlow"
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal"
import { ScreenShareModal } from "@/components/chat/modals/ScreenShareModal"
import { VoiceInputModal } from "@/components/chat/modals/VoiceInputModal"
import { WebcamModal } from "@/components/chat/modals/WebcamModal"
import { Video2AppModal } from "@/components/chat/modals/Video2AppModal"
import type { LeadCaptureState } from "./types/lead-capture"
import { useChatContext } from "./context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { supabase } from "@/lib/supabase/client"
import { sampleTimelineActivities } from "@/components/chat/sidebar/sampleTimelineData"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "./types/chat"

export default function ChatPage() {
  const [sessionId] = useState(() => uuidv4())
  const { activityLog, addActivity, clearActivities } = useChatContext()
  const { toast } = useToast()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)
  const [showVideo2AppModal, setShowVideo2AppModal] = useState(false)

  const [leadCaptureState, setLeadCaptureState] = useState<LeadCaptureState>({
    stage: "initial",
    leadData: { engagementType: "chat" },
  })
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  const { messages, setMessages, input, setInput, handleInputChange, handleSubmit, isLoading, error, append } = useChat(
    {
      api: "/api/chat",
      id: sessionId,
      body: {
        leadContext: leadCaptureState.leadData,
        sessionId: sessionId,
      },
      // The stable version correctly added a timestamp to incoming messages.
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
    },
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(scrollToBottom, [messages])

  // This effect correctly triggered the lead capture flow.
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
    setMessages([])
    setLeadCaptureState({
      stage: "initial",
      leadData: { engagementType: "chat" },
    })
    setShowLeadCapture(false)
    clearActivities()
    toast({ title: "New Chat Started" })
  }, [setMessages, clearActivities, toast])

  // The original, simpler submission logic.
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    if (leadCaptureState.stage === "collecting_info") {
      toast({
        title: "Please complete the form first",
        description: "We need your details to start the AI consultation.",
        variant: "destructive",
      })
      e.preventDefault()
      return
    }
    if (input.trim()) {
      activityLogger.log({ type: "user_action", title: "User Message Sent", description: input, status: "completed" })
      handleSubmit(e, {
        options: {
          body: {
            // Ensure the latest lead context is sent with the message
            leadContext: leadCaptureState.leadData,
          },
        },
      })
    }
  }

  const handleLeadCaptureComplete = (leadData: LeadCaptureState["leadData"]) => {
    setLeadCaptureState({ stage: "consultation", leadData } as LeadCaptureState)
    setShowLeadCapture(false)
    append({
      id: uuidv4(),
      role: "assistant",
      content: `Hello ${leadData.name}! 👋 Thanks for providing your details. I'm now ready to assist. How can I help with your AI automation goals today?`,
      timestamp: new Date(),
    })
    toast({ title: "Welcome!", description: `Starting consultation for ${leadData.name}.` })
  }

  const handleImageUpload = useCallback(
    (imageData: string, fileName: string) => {
      append({
        id: uuidv4(),
        role: "user",
        content: `[Image uploaded: ${fileName}] Please analyze this image.`,
        imageUrl: imageData,
        timestamp: new Date(),
      })
      activityLogger.log({ type: "image_upload", title: "Image Uploaded", description: fileName, status: "completed" })
    },
    [append],
  )

  const handleFileUpload = (file: File) => {
    append({
      id: uuidv4(),
      role: "user",
      content: `[File uploaded: ${file.name}] Please summarize or analyze this document.`,
      timestamp: new Date(),
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
      append({ id: uuidv4(), role: "user", content: transcript, timestamp: new Date() })
      activityLogger.log({ type: "voice_input", title: "Voice Input Sent", status: "completed" })
    },
    [append],
  )

  const handleWebcamCapture = useCallback(
    (imageData: string) => {
      append({
        id: uuidv4(),
        role: "user",
        content: "[Webcam image captured] Please analyze this image.",
        imageUrl: imageData,
        timestamp: new Date(),
      })
      activityLogger.log({ type: "image_capture", title: "Webcam Photo Captured", status: "completed" })
    },
    [append],
  )

  const handleScreenShareAnalysis = useCallback(
    (analysis: string) => {
      append({
        id: uuidv4(),
        role: "assistant",
        content: `**Screen Analysis:**\n${analysis}`,
        timestamp: new Date(),
      })
      activityLogger.log({ type: "vision_analysis", title: "Screen Analyzed", status: "completed" })
    },
    [append],
  )

  const handleVideoAppResult = useCallback(
    (result: { spec: string; code: string }) => {
      append({
        id: uuidv4(),
        role: "assistant",
        content: `I have successfully generated a new learning app based on the video.`,
        timestamp: new Date(),
      })
      activityLogger.log({ type: "tool_used", title: "Video-to-App Generated", status: "completed" })
    },
    [append],
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

  return (
    <ChatLayout>
      <div className="flex h-full">
        <DesktopSidebar
          activities={activityLog.length > 0 ? activityLog : sampleTimelineActivities}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader onDownloadSummary={handleDownloadSummary} activities={activityLog} onNewChat={handleNewChat} />
          <div className="flex-1 overflow-hidden relative">
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
            activityLogger.log({ type: "screen_share", title: "Screen Share Started", status: "in_progress" })
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
              id: uuidv4(),
              role: "assistant",
              content: `**Webcam Analysis:**\n${analysis}`,
              timestamp: new Date(),
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
    </ChatLayout>
  )
}
