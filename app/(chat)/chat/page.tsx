"use client"

import { useState, useRef, useEffect } from "react"
import { ChatArea } from "@/components/chat/ChatArea"
import { ChatFooter } from "@/components/chat/ChatFooter"
import { ChatLayout } from "@/components/chat/ChatLayout"
import { PageShell } from "@/components/page-shell"
import { VoiceInput } from "@/components/chat/tools/VoiceInput"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare"
import { ROICalculator } from "@/components/chat/tools/ROICalculator"
import { VideoToApp } from "@/components/chat/tools/VideoToApp"
import { VerticalProcessChain } from "@/components/chat/activity/VerticalProcessChain"
import { DemoSessionProvider, useDemoSession } from "@/components/demo-session-manager"
import { DemoSessionCard } from "@/components/chat/sidebar/DemoSessionCard"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import type { Message } from "@/app/(chat)/chat/types/chat"
import { LeadProgressIndicator } from "@/components/chat/LeadProgressIndicator"
import { ConversationStage } from "@/lib/lead-manager"

// Stage configuration for progress display
const stageConfig = {
  [ConversationStage.GREETING]: { order: 1 },
  [ConversationStage.NAME_COLLECTION]: { order: 2 },
  [ConversationStage.EMAIL_CAPTURE]: { order: 3 },
  [ConversationStage.BACKGROUND_RESEARCH]: { order: 4 },
  [ConversationStage.PROBLEM_DISCOVERY]: { order: 5 },
  [ConversationStage.SOLUTION_PRESENTATION]: { order: 6 },
  [ConversationStage.CALL_TO_ACTION]: { order: 7 }
}

// Define the actual tool result types based on the existing service
interface ROICalculationResult {
  companySize: string
  industry: string
  useCase: string
  currentProcessTime: number
  currentCost: number
  automationPotential: number
  estimatedROI: number
  timeSavings: number
  costSavings: number
  paybackPeriod: number
}

interface VideoAppResult {
  videoUrl: string
  title: string
  spec: string
  code: string
  summary: string
}

function ChatPageContent() {
  const { incrementUsage } = useDemoSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)
  const [showROICalculatorModal, setShowROICalculatorModal] = useState(false)
  const [showVideo2AppModal, setShowVideo2AppModal] = useState(false)
  const [videoToAppSessions, setVideoToAppSessions] = useState<Map<string, any>>(new Map())
  const [showDemoSidebar, setShowDemoSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [conversationStage, setConversationStage] = useState<ConversationStage>(ConversationStage.GREETING)
  const [leadData, setLeadData] = useState<{name?: string; email?: string; company?: string}>({})
  const [sessionId] = useState(() => Date.now().toString())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowDemoSidebar(false) // Hide sidebar on mobile by default
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (message: Omit<Message, "id" | "createdAt">) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setMessages(prev => [...prev, newMessage])
  }

  // YouTube URL detection
  const detectYouTubeURL = (text: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = text.match(regex)
    return match ? match[0] : null
  }

  const handleVideoToAppStart = (videoUrl: string) => {
    const videoSessionId = Date.now().toString()
    
    // Add VideoToApp card to messages
    addMessage({
      role: "assistant",
      content: "I've detected a YouTube URL! I'll help you create an interactive learning app from this video.",
      videoToAppCard: {
        videoUrl,
        status: 'pending',
        sessionId: videoSessionId,
        progress: 0
      }
    })

    // Update session state
    setVideoToAppSessions(prev => new Map(prev.set(videoSessionId, {
      videoUrl,
      status: 'pending',
      progress: 0
    })))
  }

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return

    // Check for YouTube URL
    const youtubeUrl = detectYouTubeURL(content)
    if (youtubeUrl) {
      // Add user message
      addMessage({
        role: "user",
        content: content.trim(),
        imageUrl,
      })
      
      // Start Video2App process
      handleVideoToAppStart(youtubeUrl)
      setInput("")
      return
    }

    // Add user message
    addMessage({
      role: "user",
      content: content.trim(),
      imageUrl,
    })

    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              role: "user",
              content: content.trim(),
              imageUrl,
            },
          ],
          data: {
            sessionId: sessionId,
            conversationSessionId: sessionId,
            enableLeadGeneration: true
          }
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Handle SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ""
      
      if (reader) {
        // Add empty assistant message that we'll update
        const assistantMessageId = Date.now().toString()
        addMessage({
          role: "assistant",
          content: "",
        })
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                // Update conversation stage and lead data if provided
                if (data.conversationStage) {
                  setConversationStage(data.conversationStage)
                }
                
                if (data.leadData) {
                  setLeadData(prev => ({
                    ...prev,
                    ...data.leadData
                  }))
                }
                
                // Append content
                if (data.content) {
                  assistantMessage += data.content
                  // Update the last message
                  setMessages(prev => prev.map((msg, idx) => 
                    idx === prev.length - 1 
                      ? { ...msg, content: assistantMessage }
                      : msg
                  ))
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
      
      // Track usage in demo session
      incrementUsage(1000, 1) // Estimate 1000 tokens per request
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage({
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      handleSendMessage(transcript)
    }
  }

  const handleWebcamCapture = (imageData: string) => {
    handleSendMessage("I've captured an image from my webcam. Can you analyze it?", imageData)
  }

  const handleImageUpload = (imageData: string, fileName: string) => {
    handleSendMessage(`I've uploaded an image: ${fileName}. Can you analyze it?`, imageData)
  }

  const handleFileUpload = (file: File) => {
    // Handle file upload logic here
    console.log("File uploaded:", file.name)
  }

  const handleROICalculation = (result: ROICalculationResult) => {
    const message = `ROI Analysis Results:
    
**Business Details:**
- Company Size: ${result.companySize}
- Industry: ${result.industry}
- Use Case: ${result.useCase}

**Current State:**
- Process Time: ${result.currentProcessTime} hours
- Current Cost: $${result.currentCost.toLocaleString()}

**Automation Benefits:**
- Automation Potential: ${result.automationPotential}%
- Estimated ROI: ${result.estimatedROI.toFixed(2)}%
- Time Savings: ${result.timeSavings} hours
- Cost Savings: $${result.costSavings.toLocaleString()}
- Payback Period: ${result.paybackPeriod.toFixed(1)} months`

    addMessage({
      role: "assistant",
      content: message,
    })
  }

  const handleVideoAppResult = (result: VideoAppResult) => {
    const message = `Video to App Analysis:

**Project Overview:**
- Title: ${result.title}
- Video URL: ${result.videoUrl}

**Generated Specification:**
${result.spec}

**Generated Code:**
\`\`\`
${result.code}
\`\`\`

**Summary:**
${result.summary}`

    addMessage({
      role: "assistant",
      content: message,
    })
  }

  const handleScreenAnalysis = (analysis: string) => {
    handleSendMessage(`I've shared my screen. Here's what I can see: ${analysis}`)
  }

  return (
    <PageShell variant="fullscreen">
      <ChatLayout
        footer={
          <ChatFooter
            input={input}
            setInput={setInput}
            handleInputChange={(e) => setInput(e.target.value)}
            handleSubmit={(e) => {
              e.preventDefault()
              handleSendMessage(input)
            }}
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
            onImageUpload={handleImageUpload}
            onVoiceTranscript={handleVoiceTranscript}
            showVoiceModal={showVoiceModal}
            setShowVoiceModal={setShowVoiceModal}
            showWebcamModal={showWebcamModal}
            setShowWebcamModal={setShowWebcamModal}
            showScreenShareModal={showScreenShareModal}
            setShowScreenShareModal={setShowScreenShareModal}
            setShowVideo2AppModal={setShowVideo2AppModal}
            setShowROICalculatorModal={setShowROICalculatorModal}
          />
        }
      >
        <div className="flex flex-1 overflow-hidden relative">
          <ChatArea
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onVoiceTranscript={handleVoiceTranscript}
            onWebcamCapture={handleWebcamCapture}
            onROICalculation={handleROICalculation}
            onVideoAppResult={handleVideoAppResult}
            onScreenAnalysis={handleScreenAnalysis}
          />
          
          {/* Progress Indicator - Always Visible on Right */}
          <LeadProgressIndicator 
            currentStage={conversationStage}
            leadData={leadData}
          />
          
          {/* Mobile Lead Progress Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden fixed bottom-20 right-4 z-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Progress
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px]">
              <LeadProgressIndicator 
                currentStage={conversationStage}
                leadData={leadData}
              />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Modals */}
        {showVoiceModal && (
          <VoiceInput
            mode="modal"
            onClose={() => setShowVoiceModal(false)}
            onTranscript={handleVoiceTranscript}
          />
        )}
        
        {showWebcamModal && (
          <WebcamCapture
            mode="modal"
            onClose={() => setShowWebcamModal(false)}
            onCapture={handleWebcamCapture}
            onAIAnalysis={(analysis: string) => {
              addMessage({
                role: "assistant",
                content: analysis,
              })
            }}
          />
        )}
        
        {showScreenShareModal && (
          <ScreenShare
            mode="modal"
            onClose={() => setShowScreenShareModal(false)}
            onAnalysis={handleScreenAnalysis}
          />
        )}
        
        {showROICalculatorModal && (
          <ROICalculator
            mode="modal"
            onClose={() => setShowROICalculatorModal(false)}
            onComplete={handleROICalculation}
          />
        )}
        
        {showVideo2AppModal && (
          <VideoToApp
            mode="modal"
            onClose={() => setShowVideo2AppModal(false)}
            onAnalysisComplete={handleVideoAppResult}
          />
        )}
      </ChatLayout>
    </PageShell>
  )
}

export default function ChatPage() {
  return (
    <DemoSessionProvider>
      <ChatPageContent />
    </DemoSessionProvider>
  )
}
