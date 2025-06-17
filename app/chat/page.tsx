"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageSquare, ArrowLeft, Mic, Camera, Image, Menu, X, Play, BookOpen } from "lucide-react"
import Link from "next/link"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { DynamicDataRenderer } from "@/components/dynamic-data-renderer"
import { parseDataFromText } from "@/lib/data-parser"
import type { DataItem } from "@/lib/data-types"
import { VoiceInputModal } from "@/components/voice-input-modal"
import { WebcamModal } from "@/components/webcam-modal"
import { ChatSidePanel } from "@/components/chat-side-panel"
import { VideoLearningModal } from "@/components/video-learning-modal"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  dataItems?: DataItem[]
}

function ChatPageContent() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Voice input state
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [currentTranscription, setCurrentTranscription] = useState("")
  const [aiVoiceState, setAiVoiceState] = useState<"listening" | "processing" | "idle" | "error">("idle")
  const recognition = useRef<SpeechRecognition | null>(null)
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Camera/Image state
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Side panel state
  const [showSidePanel, setShowSidePanel] = useState(false)

  // Video learning state
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechSupported && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = false
      
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setCurrentTranscription(transcript)
        setAiVoiceState('idle')
        setShowVoiceModal(false)
      }
      
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setAiVoiceState('error')
        setTimeout(() => {
          setAiVoiceState('idle')
          setShowVoiceModal(false)
        }, 2000)
      }
      
      recognition.current.onend = () => {
        // Reset state when recognition ends (use callback to get current state)
        setAiVoiceState(currentState => {
          if (currentState === 'listening') {
            setShowVoiceModal(false)
            return 'idle'
          }
          return currentState
        })
      }
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.stop()
      }
    }
  }, [isSpeechSupported])

  // Initialize camera when webcam modal opens
  useEffect(() => {
    if (showWebcamModal && videoRef.current) {
      console.log("Initializing camera...")
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          console.log("Camera stream obtained")
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setIsCameraActive(true)
          }
        })
        .catch((error) => {
          console.error("Camera access denied or failed:", error)
          setShowWebcamModal(false)
          alert("Camera access denied. Please allow camera permissions and try again.")
        })
    }

    return () => {
      // Cleanup camera stream when modal closes
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        setIsCameraActive(false)
      }
    }
  }, [showWebcamModal])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("=== FORM SUBMIT DEBUG ===")
    console.log("Form submitted with input:", input)
    console.log("Input length:", input.length)
    console.log("Trimmed input:", input.trim())
    
    if (!input.trim()) {
      console.log("Empty input, returning early")
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    console.log("About to make API call...") // Debug log

    // Real AI API call
    try {
      const currentImageData = getCurrentImage()
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          imageData: currentImageData,
          cameraFrame: null,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      let assistantMessage = ""
      const assistantMessageId = (Date.now() + 1).toString()

      // Add empty assistant message first
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        console.log("Received chunk:", chunk) // Debug log
        
        const lines = chunk.split("\n").filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log("Parsed data:", data) // Debug log
              
              if (data.content) {
                assistantMessage += data.content

                // Parse the message content into data items
                const dataItems = parseDataFromText(assistantMessage)

                setMessages((prev) => {
                  const newMessages = [...prev]
                  const existingIndex = newMessages.findIndex((m) => m.id === assistantMessageId)

                  if (existingIndex >= 0) {
                    newMessages[existingIndex] = {
                      ...newMessages[existingIndex],
                      content: assistantMessage,
                      dataItems: dataItems.length > 0 ? dataItems : undefined,
                    }
                  }

                  return newMessages
                })
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e, "Line:", line)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    console.log("=== MICROPHONE BUTTON DEBUG ===")
    console.log("Button clicked, current state:", aiVoiceState)
    console.log("Speech supported:", isSpeechSupported)
    console.log("Recognition available:", !!recognition.current)
    console.log("Window object:", typeof window)
    
    if (!isSpeechSupported || !recognition.current) {
      console.log("BLOCKED: Speech not supported or recognition not available")
      return
    }

    if (aiVoiceState === "listening") {
      try {
        recognition.current.stop()
      } catch (e) {
        console.log("Recognition already stopped")
      }
      setAiVoiceState("idle")
      setShowVoiceModal(false)
    } else {
      setAiVoiceState("listening")
      setCurrentTranscription("")
      setShowVoiceModal(true)
      
      try {
        recognition.current.start()
      } catch (e) {
        console.error("Failed to start recognition:", e)
        // Reset state if start fails
        setAiVoiceState("error")
        setTimeout(() => {
          setAiVoiceState("idle")
          setShowVoiceModal(false)
        }, 2000)
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== IMAGE UPLOAD DEBUG ===")
    console.log("File input changed")
    const file = event.target.files?.[0]
    console.log("Selected file:", file)
    
    if (file) {
      console.log("File details:", { name: file.name, size: file.size, type: file.type })
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log("File read successfully, data length:", result.length)
        setUploadedImage(result)
        setCapturedImage(null) // Clear captured image if uploading
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    console.log("=== CAMERA CAPTURE DEBUG ===")
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas to data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        console.log("Image captured, data length:", imageData.length)
        
        setCapturedImage(imageData)
        setUploadedImage(null) // Clear uploaded image if capturing
        setShowWebcamModal(false)
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        setIsCameraActive(false)
      }
    } else {
      console.log("Cannot capture: video, canvas, or camera not ready")
    }
  }

  const clearImages = () => {
    setCapturedImage(null)
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getCurrentImage = () => capturedImage || uploadedImage

  return (
    <>
      {/* Voice Input Modal */}
      {showVoiceModal && (
        <VoiceInputModal
          isListening={aiVoiceState === "listening"}
          currentTranscription={currentTranscription}
          aiState={aiVoiceState}
          onClose={() => {
            setShowVoiceModal(false)
            setAiVoiceState("idle")
            if (recognition.current) {
              recognition.current.stop()
            }
          }}
          theme="light"
        />
      )}

      {/* Webcam Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Take Photo</h2>
              <button
                onClick={() => {
                  setShowWebcamModal(false)
                  setIsCameraActive(false)
                  // Stop camera stream
                  if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream
                    stream.getTracks().forEach(track => track.stop())
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                  <p>Initializing camera...</p>
                </div>
              )}
            </div>
            
            {isCameraActive && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCameraCapture}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  📸 Capture Photo
                </button>
              </div>
            )}
          </div>
        </div>
              )}

      {/* Video Learning Modal */}
      {showVideoModal && (
        <VideoLearningModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          theme="light"
        />
      )}

      {/* Main Chat Interface */}
    <div className="flex h-screen bg-background">
      {/* Side Panel */}
      {showSidePanel && (
        <div className="w-80 border-r bg-gray-50">
          <ChatSidePanel
            chatHistory={messages}
            onClose={() => setShowSidePanel(false)}
            theme="light"
            onDownloadTranscript={() => {
              const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
              const blob = new Blob([transcript], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'chat-transcript.txt'
              a.click()
              URL.revokeObjectURL(url)
            }}
            onSummarizeChat={() => {
              console.log("Summarize chat clicked")
              // TODO: Implement chat summarization
            }}
            onGenerateFollowUpBrief={() => {
              console.log("Generate follow-up brief clicked")
              // TODO: Implement follow-up brief generation
            }}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-3">
            <Link href="/" className="p-2 rounded hover:bg-gray-100">
              <ArrowLeft size={20} />
            </Link>
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="p-2 rounded hover:bg-gray-100"
            >
              {showSidePanel ? <X size={20} /> : <Menu size={20} />}
            </button>
            <MessageSquare size={20} className="text-orange-500" />
            <h1 className="text-xl font-bold">F.B/c AI Chat</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm"
            >
              <Play size={16} />
              <span>Learn</span>
            </button>
            <div className="text-sm text-gray-500">
              {messages.length > 0 && `${messages.length} messages`}
            </div>
          </div>
        </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <MessageSquare size={48} className="mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-bold mb-2">Welcome to F.B/c AI</h2>
            <p>Start a conversation with your AI assistant.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-lg p-3 max-w-[70%] ${
                msg.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
                         >
               {msg.role === "assistant" && msg.dataItems ? (
                 <DynamicDataRenderer data={msg.dataItems} theme="light" />
               ) : (
                 <p>{msg.content}</p>
               )}
             </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        {/* Image Preview */}
        {getCurrentImage() && (
          <div className="mb-3 relative inline-block">
            <img 
              src={getCurrentImage()!} 
              alt="Selected" 
              className="w-20 h-20 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={clearImages}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={!isSpeechSupported}
            className={`px-3 py-2 rounded-lg transition-colors ${
              aiVoiceState === "listening" 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } disabled:opacity-50`}
            title={aiVoiceState === "listening" ? "Stop Recording" : "Voice Input"}
          >
            <Mic size={20} />
          </button>
          
          <button
            type="button"
            onClick={() => {
              console.log("=== CAMERA BUTTON DEBUG ===")
              console.log("Camera button clicked")
              setShowWebcamModal(true)
              console.log("Webcam modal should open")
            }}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Take Photo"
          >
            <Camera size={20} />
          </button>
          
          <button
            type="button"
            onClick={() => {
              console.log("=== IMAGE BUTTON DEBUG ===")
              console.log("Image upload button clicked")
              console.log("File input ref:", fileInputRef.current)
              fileInputRef.current?.click()
              console.log("File input click triggered")
            }}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Upload Image"
          >
            <Image size={20} />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message or use voice..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      </div>
    </div>
    </>
  )
}

export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatPageContent />
    </ErrorBoundary>
  )
}
