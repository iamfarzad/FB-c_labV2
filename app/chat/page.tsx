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
import type { Message } from "./types/chat"
import type { LeadCaptureState } from "./types/lead-capture"
import { useChatContext } from "./context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { supabase } from "@/lib/supabase/client"
import { sampleTimelineActivities } from "@/components/chat/sidebar/sampleTimelineData"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"
import { v4 as uuidv4 } from "uuid"

export default function ChatPage() {
  const [sessionId] = useState(() => uuidv4())
  const { activityLog, addActivity, clearActivities } = useChatContext()
  const { toast } = useToast()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)

  const [leadCaptureState, setLeadCaptureState] = useState<LeadCaptureState>({
    stage: "initial",
    hasName: false,
    hasEmail: false,
    hasAgreedToTC: false,
    leadData: { engagementType: "chat" },
  })
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  const { messages, setMessages, input, setInput, handleInputChange, handleSubmit, isLoading, error, append, reload } =
    useChat({
      api: "/api/chat",
      id: sessionId,
      body: {
        // Send additional data to the API
        leadContext: leadCaptureState.leadData,
        sessionId: sessionId,
      },
      onFinish: (message) => {
        activityLogger.log({
          type: "ai_stream",
          title: "AI Response Received",
          description: `Received full response. Length: ${message.content.length}`,
          status: "completed",
        })
      },
      onError: (err) => {
        toast({
          title: "An error occurred",
          description: err.message,
          variant: "destructive",
        })
        activityLogger.log({
          type: "error",
          title: "Chat API Error",
          description: err.message,
          status: "failed",
        })
      },
    })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  // Trigger lead capture after first user message
  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user")
    if (userMessages.length === 1 && leadCaptureState.stage === "initial") {
      setShowLeadCapture(true)
      setLeadCaptureState((prev) => ({
        ...prev,
        stage: "collecting_info",
        leadData: {
          ...prev.leadData,
          initialQuery: userMessages[0]?.content,
        },
      }))
    }
  }, [messages, leadCaptureState.stage])

  // Listen for real-time activity updates from Supabase
  useEffect(() => {
    const channel = supabase
      .channel(`activity-log-${Date.now()}`)
      .on("broadcast", { event: "activity-update" }, ({ payload }) => {
        addActivity(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addActivity])

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
    toast({
      title: "New Chat Started",
      description: "Previous conversation cleared",
    })
  }, [setMessages, clearActivities, toast])

  const handleImageUpload = useCallback(
    (imageData: string, fileName: string) => {
      const imageMessage: Message = {
        id: `img_${Date.now()}`,
        role: "user",
        content: `📸 Uploaded image: ${fileName}`,
        imageUrl: imageData,
      }
      append(imageMessage) // Use `append` from useChat to add message without triggering API call yet

      activityLogger.log({
        type: "image_upload",
        title: "Image Added to Chat",
        description: `${fileName} ready for AI analysis`,
        status: "completed",
      })
      toast({
        title: "Image Uploaded",
        description: `${fileName} added to conversation`,
      })
    },
    [append, toast],
  )

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    if (leadCaptureState.stage !== "consultation") {
      toast({
        title: "Please complete the form",
        description: "We need a bit more information to start the consultation.",
        variant: "destructive",
      })
      e.preventDefault() // Prevent submission
      return
    }
    activityLogger.log({
      type: "user_action",
      title: "User Message Sent",
      description: input.substring(0, 80) + (input.length > 80 ? "..." : ""),
      status: "completed",
    })
    handleSubmit(e)
  }

  const handleLeadCaptureComplete = (leadData: LeadCaptureState["leadData"]) => {
    setLeadCaptureState((prev) => ({
      ...prev,
      stage: "consultation",
      leadData,
    }))
    setShowLeadCapture(false)

    const welcomeMessage: Message = {
      id: `welcome_${Date.now()}`,
      role: "assistant",
      content: `Hello ${leadData.name}! 👋 Thank you for providing your details. I'm now ready to assist you. How can I help you with AI automation today?`,
    }
    setMessages([...messages, welcomeMessage])

    toast({
      title: "Welcome to F.B/c AI!",
      description: `Starting personalized consultation for ${leadData.name}`,
    })
  }

  const handleFileUpload = (file: File) => {
    activityLogger.log({
      type: "file_upload",
      title: "File Uploaded",
      description: file.name,
      status: "completed",
      details: [`File: ${file.name}`, `Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`],
    })
  }

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      if (!transcript.trim()) return
      setInput(transcript) // Set the input field, user can review before sending
      toast({
        title: "Transcript Ready",
        description: "Voice input has been transcribed. Press send to submit.",
      })
    },
    [setInput, toast],
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
    onSendMessage: () => {
      if (input.trim()) {
        const form = inputRef.current?.closest("form")
        if (form)
          handleSendMessage({
            preventDefault: () => {},
            ...new Event("submit", { cancelable: true }),
          } as unknown as React.FormEvent<HTMLFormElement>)
      }
    },
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
          onActivityClick={(activity) => console.log("Activity clicked:", activity)}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader
            onDownloadSummary={handleDownloadSummary}
            activities={activityLog.length > 0 ? activityLog : sampleTimelineActivities}
            onNewChat={handleNewChat}
            onActivityClick={(activity) => console.log("Activity clicked:", activity)}
          />
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
            <ChatMain messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="shrink-0">
            <ChatFooter
              input={input}
              setInput={setInput} // Pass setInput for direct manipulation if needed
              onSendMessage={() => {
                /* Let form's onSubmit handle it */
              }}
              isLoading={isLoading}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  e.currentTarget.closest("form")?.requestSubmit()
                }
              }}
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
          </form>
        </div>
      </div>
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </ChatLayout>
  )
}
