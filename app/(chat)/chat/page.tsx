"use client"
import { useState, useEffect, useCallback } from "react"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { DesktopSidebar } from "@/components/chat/sidebar/DesktopSidebar"
import { useDemoSession } from "@/components/demo-session-manager"
import { FixedVerticalProcessChain } from "@/components/chat/activity/FixedVerticalProcessChain"
import { ChatContainer } from "./components/ChatContainer"
import { ChatModals } from "./components/ChatModals"
import { useModalManager } from "./hooks/useModalManager"
import { useLeadCapture } from "./hooks/useLeadCapture"
import { useChatController } from "./hooks/useChatController"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useChatContext } from "@/hooks/chat/useChatContext" // Import useChatContext
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts" // Import useKeyboardShortcuts

// Disable static optimization for this page
export const dynamic = "force-dynamic"

export default function ChatPage() {
  const { sessionId, createSession } = useDemoSession()
  const { activityLog, addActivity, clearActivities, cleanupStuckActivities } = useChatContext()
  const { toast } = useToast()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const { activeModal, openModal, closeModal, voiceOutputData, openVoiceOutputModal, closeVoiceOutputModal } =
    useModalManager()

  // The order of these hooks is important
  const { messages, isLoading, error, clearMessages, setInput, append, ...chatController } = useChatController({
    sessionId,
    leadCaptureState: {
      stage: "initial",
      hasName: false,
      hasEmail: false,
      hasAgreedToTC: false,
      leadData: { engagementType: "chat" },
    }, // This will be updated by the useLeadCapture hook
  })

  const { leadCaptureState, showLeadCapture, handleLeadCaptureComplete, resetLeadCapture } = useLeadCapture(
    messages,
    sessionId,
  )

  const handleNewChat = useCallback(() => {
    clearMessages()
    resetLeadCapture()
    createSession()
    toast({ title: "New Chat Started" })
  }, [clearMessages, resetLeadCapture, createSession, toast])

  const handleDownloadSummary = useCallback(async () => {
    // This logic remains complex and specific, so it stays here for now.
    // It could be extracted to its own hook in the future.
    try {
      const response = await fetch("/api/export-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, leadEmail: leadCaptureState.leadData.email }),
      })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `FB-c_Summary_${leadCaptureState.leadData.name?.replace(/\s+/g, "_") || "user"}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast({ title: "PDF Summary Exported", description: "Summary downloaded successfully." })
      addActivity({ type: "tool_used", title: "PDF Summary Exported", status: "completed" })
    } catch (err) {
      console.error("Export summary error:", err)
      toast({ title: "Export Failed", description: (err as Error).message, variant: "destructive" })
    }
  }, [sessionId, leadCaptureState.leadData, toast, addActivity])

  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onExportSummary: handleDownloadSummary,
    onToggleSidebar: () => setIsSidebarOpen((v) => !v),
    onFocusInput: () => {}, // Input ref is now inside ChatInput
    onOpenVoice: () => openModal("voiceInput"),
    onOpenCamera: () => openModal("webcam"),
    onOpenScreenShare: () => openModal("screenShare"),
  })

  useEffect(() => {
    const channel = supabase
      .channel(`activity-log-${sessionId}`)
      .on("broadcast", { event: "activity-update" }, ({ payload }: { payload: any }) => addActivity(payload))
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [addActivity, sessionId])

  return (
    <ChatLayout>
      <FixedVerticalProcessChain activities={activityLog} onActivityClick={() => {}} />
      <div className="flex h-full w-full overflow-hidden">
        <DesktopSidebar
          activities={activityLog}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((v) => !v)}
          onNewChat={handleNewChat}
          onActivityClick={() => {}}
          onClearActivities={clearActivities}
          onCleanupStuckActivities={cleanupStuckActivities}
        />
        <ChatContainer
          leadName={leadCaptureState.leadData.name}
          onDownloadSummary={handleDownloadSummary}
          activities={activityLog}
          onNewChat={handleNewChat}
          messages={messages}
          isLoading={isLoading}
          error={error}
          onExampleQuery={(query) => setInput(query)}
          onRetry={() => window.location.reload()} // Simple retry for now
          input={chatController.input}
          handleInputChange={chatController.handleInputChange}
          handleSubmit={chatController.handleSubmit}
          onFileUpload={chatController.handleFileUpload}
          onImageUpload={chatController.handleImageUpload}
          openModal={openModal}
          showLeadCapture={showLeadCapture}
          onLeadCaptureComplete={handleLeadCaptureComplete}
          engagementType={leadCaptureState.leadData.engagementType}
          initialQuery={leadCaptureState.leadData.initialQuery}
        />
      </div>
      <ChatModals
        activeModal={activeModal}
        closeModal={closeModal}
        voiceOutputData={voiceOutputData}
        closeVoiceOutputModal={closeVoiceOutputModal}
        handleScreenShareAnalysis={chatController.handleScreenShareAnalysis}
        handleVoiceTranscript={chatController.handleVoiceTranscript}
        handleWebcamCapture={chatController.handleWebcamCapture}
        handleVideoAppResult={chatController.handleVideoAppResult}
        handleROICalculation={chatController.handleROICalculation}
        append={append}
        addActivity={addActivity}
        leadContext={leadCaptureState.leadData}
      />
    </ChatLayout>
  )
}
