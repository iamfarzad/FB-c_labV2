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
import { ROICalculatorModal } from "@/components/chat/modals/ROICalculatorModal"
import { useDemoSession } from "@/components/demo-session-manager"

import type { LeadCaptureState } from "./types/lead-capture"
import { useChatContext } from "./context/ChatProvider"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import type { Message } from "./types/chat"

// Disable static optimization for this page
export const dynamic = 'force-dynamic'

export default function ChatPage() {
  const { sessionId, createSession } = useDemoSession()
  const { activityLog, addActivity, clearActivities } = useChatContext()
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
  const [showROICalculatorModal, setShowROICalculatorModal] = useState(false)

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

  // Initialize session on component mount
  useEffect(() => {
    // Create a new session if none exists
    if (!sessionId) {
      createSession()
    }
    setCurrentSessionId(sessionId)
    setIsLoadingLeadData(false)
  }, [sessionId, createSession])

  // Reset conversation when session changes
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      // Session changed, reset everything
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
      sessionId: sessionId || 'anonymous',
      userId: "anonymous_user" // Could be enhanced with real user tracking
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
      addActivity({ type: "error", title: "Chat API Error", description: err.message, status: "failed" })
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastSubmitTimeRef = useRef<number>(0)
  const SUBMIT_COOLDOWN = 2000 // 2 seconds between submissions

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  useEffect(scrollToBottom, [messages])

  // Clear all session data when component unmounts or session changes
  useEffect(() => {
    return () => {
      // Cleanup function - clear any session-related data
      try {
        // Only clear sessionStorage, not localStorage to avoid affecting other tabs
        sessionStorage.removeItem('demo-session-id')
      } catch (error) {
        console.error('Error clearing session data:', error)
      }
    }
  }, [])

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

  useEffect(() => {
    const channel = supabase
      .channel(`activity-log-${sessionId}`)
      .on("broadcast", { event: "activity-update" }, ({ payload }: { payload: any }) => addActivity(payload))
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
    
    // Create a new session for complete isolation
    createSession()
    
    // Clear all session-related data
    try {
      sessionStorage.removeItem('demo-session-id')
      // Clear any other session-related data
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('chat') || key.includes('session') || key.includes('lead')) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing session data:', error)
    }
    
    toast({ title: "New Chat Started" })
  }, [clearMessages, createSession, toast])

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // 🚫 RATE LIMITING: Prevent rapid successive submissions
    const now = Date.now()
    if (now - lastSubmitTimeRef.current < SUBMIT_COOLDOWN) {
      console.log('🚫 Rate limited: Skipping rapid submission', {
        timeSinceLastSubmit: now - lastSubmitTimeRef.current,
        input: input.substring(0, 50)
      })
      toast({
        title: "Please wait",
        description: "You're sending messages too quickly. Please wait a moment.",
        variant: "destructive"
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
      console.log('📤 Submitting message:', {
        contentLength: input.length,
        sessionId,
        timestamp: new Date().toISOString()
      })
      
      handleSubmit(e)
      addActivity({ type: "user_action", title: "User Message Sent", description: input.substring(0, 100), status: "completed" })
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
    
    // Store lead data in sessionStorage only (not localStorage) for session isolation
    try {
      sessionStorage.setItem('fb_lead_data', JSON.stringify(leadData))
    } catch (error) {
      console.error('Failed to save lead data to sessionStorage:', error)
    }
    
    toast({ title: "Welcome!", description: `Starting consultation for ${leadData.name}.` })
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
    [append],
  )

  const handleFileUpload = async (file: File) => {
    try {
      // Show upload activity
      addActivity({
        type: "file_upload",
        title: "File Upload Started",
        description: `Uploading ${file.name}`,
        status: "in_progress",
      })

      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload file with session ID
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-demo-session-id': sessionId || 'anonymous',
          'x-user-id': 'anonymous_user'
        },
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadResponse.json()

      // Add file message to chat
      append({
        role: "user",
        content: `[File uploaded: ${file.name}] Please analyze this document.`,
      })

      // Update activity
      addActivity({
        type: "file_upload",
        title: "File Uploaded",
        description: file.name,
        status: "completed",
      })

      // If it's a document file, trigger analysis
      if (file.type === 'application/pdf' || file.type === 'text/plain' || file.type.includes('document')) {
        try {
          // Read file content for analysis
          const fileContent = await file.text()
          const base64Data = btoa(fileContent)

          // Call document analysis endpoint with session ID
          const analysisResponse = await fetch('/api/analyze-document', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-demo-session-id': sessionId || 'anonymous',
              'x-user-id': 'anonymous_user'
            },
            body: JSON.stringify({
              data: base64Data,
              mimeType: file.type,
              fileName: file.name
            })
          })

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json()
            
            // Add AI analysis to chat (use 'analysis' property, not 'summary')
            append({
              role: "assistant",
              content: `**Document Analysis for ${file.name}:**\n\n${analysisData.analysis}`,
            })

            addActivity({
              type: "doc_analysis",
              title: "Document Analyzed",
              description: `AI analysis completed for ${file.name}`,
              status: "completed",
            })
          } else {
            const errorData = await analysisResponse.json()
            throw new Error(errorData.message || 'Document analysis failed')
          }
        } catch (error) {
          console.error('Document analysis error:', error)
          append({
            role: "assistant",
            content: `I received your document "${file.name}" but encountered an issue analyzing it. Please try again or describe what you'd like me to help you with regarding this document.`,
          })
        }
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      })
      
      addActivity({
        type: "error",
        title: "Upload Failed",
        description: `Failed to upload ${file.name}`,
        status: "failed",
      })
    }
  }

  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      if (!transcript.trim()) return
      append({ role: "user", content: transcript })
      addActivity({ type: "voice_input", title: "Voice Input Sent", description: transcript.substring(0, 100), status: "completed" })
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
      addActivity({ type: "image_capture", title: "Webcam Photo Captured", description: "Webcam image captured", status: "completed" })
    },
    [append],
  )

  const handleScreenShareAnalysis = useCallback(
    (analysis: string) => {
      append({
        role: "assistant",
        content: `**Screen Analysis:**\n${analysis}`,
      })
      addActivity({ type: "vision_analysis", title: "Screen Analyzed", description: "Screen content analyzed", status: "completed" })
    },
    [append],
  )

  const handleVideoAppResult = useCallback(
    (result: { spec: string; code: string }) => {
      append({
        role: "assistant",
        content: `I have successfully generated a new learning app based on the video.`,
      })
      addActivity({ type: "tool_used", title: "Video-to-App Generated", description: "Learning app generated from video", status: "completed" })
    },
    [append],
  )

  const handleVoiceResponse = useCallback(
    (textContent: string, voiceStyle: string = "neutral") => {
      setVoiceOutputData({ textContent, voiceStyle })
      setShowVoiceOutputModal(true)
      addActivity({ 
        type: "voice_response", 
        title: "Voice Response Triggered", 
        description: `AI speaking: ${textContent.slice(0, 100)}...`, 
        status: "in_progress" 
      })
    },
    [],
  )

  const handleDownloadSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/export-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          leadEmail: leadCaptureState.leadData.email
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is PDF (binary) or JSON (fallback)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/pdf')) {
        // Handle PDF response
        const pdfBlob = await response.blob();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FB-c_Summary_${leadCaptureState.leadData.name?.replace(/\s+/g, '_') || 'user'}_${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({ 
          title: "PDF Summary Exported", 
          description: "Professional PDF summary has been generated and downloaded successfully." 
        });
        
        // Log the export activity
        addActivity({
          type: "tool_used",
          title: "PDF Summary Exported",
          description: `Generated professional PDF summary for ${leadCaptureState.leadData.name || 'user'}`,
          status: "completed"
        });
      } else {
        // Handle JSON response (fallback to markdown)
        const data = await response.json();
        
        if (data.success && data.content) {
          // Create and download the markdown file
          const blob = new Blob([data.content], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.filename || `FB-c_Summary_${sessionId}.md`;
          a.click();
          URL.revokeObjectURL(url);
          
          toast({ 
            title: "Summary Exported", 
            description: data.error || "Summary has been generated and downloaded successfully." 
          });
          
          // Log the export activity
          addActivity({
            type: "tool_used",
            title: "Summary Exported",
            description: `Generated summary for ${leadCaptureState.leadData.name || 'user'}`,
            status: "completed"
          });
        } else {
          throw new Error(data.error || 'Failed to generate summary');
        }
      }
    } catch (error) {
      console.error('Export summary error:', error);
      toast({ 
        title: "Export Failed", 
        description: error instanceof Error ? error.message : 'Failed to export summary',
        variant: "destructive"
      });
    }
  }, [messages, sessionId, toast, leadCaptureState.leadData])

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

  const handleClearActivities = useCallback(() => {
    // Clear all activities
    clearActivities()
    // Add a confirmation activity
    addActivity({ 
      type: "user_action", 
      title: "Activities Cleared", 
      description: "Activity log has been cleared", 
      status: "completed" 
    })
  }, [clearActivities, addActivity])

  return (
    <ChatLayout>
      <div className="flex h-full">
        <DesktopSidebar
          activities={activityLog}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          onNewChat={handleNewChat}
          onActivityClick={handleActivityClick}
          onClearActivities={handleClearActivities}
        />
        <div className="flex flex-col flex-1 h-full">
          <ChatHeader 
            onDownloadSummary={handleDownloadSummary} 
            activities={activityLog} 
            onNewChat={handleNewChat} 
            onActivityClick={handleActivityClick}
            leadName={leadCaptureState.leadData.name}
          />
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
          <div className="shrink-0">
            <ChatFooter
              input={input}
              setInput={setInput}
              handleInputChange={handleInputChange}
              handleSubmit={handleSendMessage}
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
              setShowROICalculatorModal={setShowROICalculatorModal}
            />
          </div>
        </div>
      </div>
      <KeyboardShortcutsModal isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />

      {showScreenShareModal && (
        <ScreenShareModal
          isOpen={showScreenShareModal}
          onClose={() => setShowScreenShareModal(false)}
          onAIAnalysis={handleScreenShareAnalysis}
          onStream={() =>
            addActivity({ type: "screen_share", title: "Screen Share Started", description: "Screen sharing session started", status: "in_progress" })
          }
        />
      )}
      {showVoiceModal && (
        <VoiceInputModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onTransferToChat={handleVoiceTranscript}
          onVoiceResponse={(responseData) => {
            setVoiceOutputData(responseData)
            setShowVoiceOutputModal(true)
          }}
          leadContext={{
            name: leadCaptureState.leadData.name,
            company: leadCaptureState.leadData.company
          }}
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
      {showROICalculatorModal && (
        <ROICalculatorModal
          isOpen={showROICalculatorModal}
          onClose={() => setShowROICalculatorModal(false)}
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


      </ChatLayout>
    )
  }
