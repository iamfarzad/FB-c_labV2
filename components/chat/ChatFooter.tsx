"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Send,
  Camera,
  Monitor,
  Mic,
  MicOff,
  Paperclip,
  FileText,
  ImageIcon,
  Youtube,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/chat/context/ChatProvider"
import { activityLogger } from "@/lib/activity-logger"
import dynamic from "next/dynamic"
import { Video2AppModal } from "./modals/Video2AppModal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Dynamically import the Live API modals to prevent SSR issues
const ScreenShareModal = dynamic(() => import("./modals/ScreenShareModal"), { ssr: false })
const VoiceInputModal = dynamic(() => import("./modals/VoiceInputModal"), { ssr: false })
const WebcamModal = dynamic(() => import("./modals/WebcamModal"), { ssr: false })

interface ChatFooterProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => void
  onSendMessage: () => void
  isLoading: boolean
  onKeyPress: (e: React.KeyboardEvent) => void
  onFileUpload: (file: File) => void
  onImageUpload?: (imageData: string, fileName: string) => void
  onVoiceTranscript?: (transcript: string) => void
  inputRef?: React.RefObject<HTMLTextAreaElement>
  showVoiceModal?: boolean
  setShowVoiceModal?: (show: boolean) => void
  showWebcamModal?: boolean
  setShowWebcamModal?: (show: boolean) => void
  showScreenShareModal?: boolean
  setShowScreenShareModal?: (show: boolean) => void
}

export function ChatFooter({
  input,
  handleInputChange,
  onSendMessage,
  isLoading,
  onKeyPress,
  onFileUpload,
  onImageUpload,
  onVoiceTranscript,
  inputRef,
  showVoiceModal = false,
  setShowVoiceModal,
  showWebcamModal = false,
  setShowWebcamModal,
  showScreenShareModal = false,
  setShowScreenShareModal,
}: ChatFooterProps) {
  const { addActivity } = useChatContext()
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [showVideo2AppModal, setShowVideo2AppModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const anyFileInputRef = useRef<HTMLInputElement>(null)
  const [setInput] = useState<string>(() => input) // Declare setInput variable

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkDevice()
    setIsMounted(true)
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  const uploadMenuItems = [
    {
      id: "image",
      label: "Upload Image",
      icon: ImageIcon,
      action: () => {
        fileInputRef.current?.click()
        setShowUploadOptions(false)
      },
    },
    {
      id: "file",
      label: "Upload File",
      icon: FileText,
      action: () => {
        anyFileInputRef.current?.click()
        setShowUploadOptions(false)
      },
    },
    {
      id: "youtube",
      label: "YouTube Video",
      icon: Youtube,
      action: () => {
        setInput(input + (input ? " " : "") + "https://youtube.com/watch?v=")
        setShowUploadOptions(false)
        addActivity({
          type: "link",
          title: "YouTube Video Ready",
          description: "Paste your YouTube URL to analyze the video",
          status: "pending",
        })
      },
    },
  ]

  // Primary action buttons (always visible)
  const primaryActions = [
    {
      id: "voice",
      icon: isRecording ? MicOff : Mic,
      action: () => setShowVoiceModal?.(true),
      active: isRecording,
      title: "Voice input (Ctrl+Shift+V)",
    },
    {
      id: "camera",
      icon: Camera,
      action: () => setShowWebcamModal?.(true),
      active: isCameraActive,
      title: "Open camera (Ctrl+Shift+C)",
    },
  ]

  // Secondary actions (collapsed on mobile)
  const secondaryActions = [
    {
      id: "upload",
      icon: Paperclip,
      action: () => setShowUploadOptions(!showUploadOptions),
      title: "Upload files",
    },
    {
      id: "screen",
      icon: Monitor,
      action: () => setShowScreenShareModal?.(true),
      title: "Share screen (Ctrl+Shift+S)",
    },
    {
      id: "video2app",
      icon: Youtube,
      action: () => setShowVideo2AppModal(true),
      title: "Video to Learning App",
    },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) {
      addActivity({
        type: "error",
        title: "Invalid File Type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        status: "failed",
      })
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addActivity({
        type: "error",
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        status: "failed",
      })
      return
    }

    setUploadingImage(true)

    // Start activity tracking
    const activityId = activityLogger.startActivity("image_upload", {
      type: "image_upload",
      title: "Uploading Image",
      description: `Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      details: [`File: ${file.name}`, `Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`, `Type: ${file.type}`],
    })

    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        const imageData = event.target?.result as string

        // Complete the upload activity
        activityLogger.completeActivity(activityId, {
          title: "Image Uploaded Successfully",
          description: `${file.name} ready for analysis`,
          status: "completed",
        })

        // Add image to chat if callback provided
        if (onImageUpload) {
          onImageUpload(imageData, file.name)
        }

        // Update input with image context
        const imagePrompt = `📸 **Image Uploaded: ${file.name}**\n\nPlease analyze this image and tell me what you see.`
        setInput(input + (input ? "\n\n" : "") + imagePrompt)

        // Log successful upload
        addActivity({
          type: "image_capture",
          title: "Image Ready for Analysis",
          description: `${file.name} uploaded successfully`,
          status: "completed",
          details: [`File: ${file.name}`, `Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`, "Ready for AI analysis"],
        })

        setUploadingImage(false)
      }

      reader.onerror = () => {
        activityLogger.completeActivity(activityId, {
          title: "Image Upload Failed",
          description: "Failed to read the image file",
          status: "failed",
        })

        addActivity({
          type: "error",
          title: "Upload Failed",
          description: "Could not read the image file",
          status: "failed",
        })

        setUploadingImage(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Image upload error:", error)

      activityLogger.completeActivity(activityId, {
        title: "Image Upload Error",
        description: "An error occurred while processing the image",
        status: "failed",
      })

      addActivity({
        type: "error",
        title: "Upload Error",
        description: "An unexpected error occurred",
        status: "failed",
      })

      setUploadingImage(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAnyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  // Handle screen share stream
  const handleStream = (stream: MediaStream) => {
    addActivity({
      type: "screen_share",
      title: "Screen Sharing Started",
      description: "Sharing your screen with the AI assistant",
      status: "in_progress",
    })

    const video = document.createElement("video")
    video.srcObject = stream
    video.play()

    video.onloadedmetadata = () => {
      setTimeout(() => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL("image/png")

        // Add screen capture to chat
        if (onImageUpload) {
          onImageUpload(imageData, "screen-capture.png")
        }

        setInput(
          input +
            (input ? "\n\n" : "") +
            "🖥️ **Screen Captured for Analysis**\n\nPlease analyze what you see on my screen and provide insights.",
        )

        stream.getTracks().forEach((track) => track.stop())

        addActivity({
          type: "screen_share",
          title: "Screen Capture Complete",
          description: "Screen captured and ready for analysis",
          status: "completed",
        })
      }, 1000)
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInput(input + (input ? " " : "") + transcript)
    addActivity({
      type: "voice_input",
      title: "Voice Input Received",
      description: "Transcribed voice to text",
      status: "completed",
    })
  }

  const handleWebcamCapture = (imageData: string) => {
    // Add webcam image to chat
    if (onImageUpload) {
      onImageUpload(imageData, "webcam-capture.jpg")
    }

    addActivity({
      type: "image_capture",
      title: "Photo Captured",
      description: "Captured photo from webcam",
      status: "completed",
    })

    setInput(input + (input ? "\n\n" : "") + "📸 **Photo Captured**\n\nPlease analyze this image I just took.")
  }

  return (
    <div
      className={cn(
        "border-t border-border bg-background/95 backdrop-blur-sm",
        // Responsive padding
        "mobile:p-3",
        "tablet:p-4",
        "desktop:p-4",
      )}
    >
      <div className="max-w-4xl mx-auto">
        {/* Input Form */}
        <div className="flex items-end gap-2 relative">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyPress}
              placeholder={
                isMobile ? "Type your message..." : "Type your message... (Ctrl+K to focus, Ctrl+Enter to send)"
              }
              className={cn(
                "resize-none border-2 focus:border-primary/50 transition-colors",
                // Responsive sizing
                "mobile:min-h-[48px] mobile:max-h-[120px] mobile:text-base",
                "tablet:min-h-[56px] tablet:max-h-[160px]",
                "desktop:min-h-[60px] desktop:max-h-[200px]",
                // Responsive padding for action buttons
                isMobile ? "pr-20" : "pr-32",
              )}
              disabled={uploadingImage}
            />

            {/* Action Buttons Container */}
            <div
              className={cn(
                "absolute bottom-2 right-2 flex items-center",
                // Responsive gap
                "mobile:gap-1",
                "tablet:gap-1.5",
                "desktop:gap-2",
              )}
            >
              {/* Primary Actions - Always Visible */}
              {primaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="icon"
                  onClick={action.action}
                  className={cn(
                    "transition-colors",
                    // Responsive sizing
                    "mobile:w-8 mobile:h-8",
                    "tablet:w-9 tablet:h-9",
                    "desktop:w-10 desktop:h-10",
                    action.active && "bg-primary/10 text-primary hover:bg-primary/20",
                  )}
                  title={action.title}
                  disabled={uploadingImage}
                >
                  <action.icon
                    className={cn("mobile:w-4 mobile:h-4", "tablet:w-4 tablet:h-4", "desktop:w-5 desktop:h-5")}
                  />
                </Button>
              ))}

              {/* Secondary Actions */}
              {isMobile ? (
                // Mobile: Dropdown menu for secondary actions
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8" disabled={uploadingImage}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {secondaryActions.map((action) => (
                      <DropdownMenuItem key={action.id} onClick={action.action} className="gap-2">
                        <action.icon className="w-4 h-4" />
                        {action.title.split(" (")[0]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // Tablet/Desktop: Individual buttons
                secondaryActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="icon"
                    onClick={action.action}
                    className={cn("tablet:w-9 tablet:h-9", "desktop:w-10 desktop:h-10")}
                    title={action.title}
                    disabled={uploadingImage}
                  >
                    <action.icon className={cn("tablet:w-4 tablet:h-4", "desktop:w-5 desktop:h-5")} />
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || uploadingImage}
            className={cn(
              "shrink-0",
              // Responsive sizing
              "mobile:h-[48px] mobile:px-4",
              "tablet:h-[56px] tablet:px-5",
              "desktop:h-[60px] desktop:px-6",
            )}
          >
            <Send className={cn("mobile:w-4 mobile:h-4", "tablet:w-4 tablet:h-4", "desktop:w-5 desktop:h-5")} />
            <span
              className={cn(
                "ml-2",
                // Hide text on mobile
                "mobile:hidden",
                "tablet:inline",
                "desktop:inline",
              )}
            >
              Send
            </span>
          </Button>

          {/* Upload Options Dropdown */}
          {showUploadOptions && !isMobile && (
            <div className="absolute bottom-16 right-4 bg-popover border rounded-md shadow-md p-1 z-50 min-w-[160px]">
              {uploadMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-8 px-2 py-1.5 text-sm font-normal hover:bg-accent hover:text-accent-foreground"
                  onClick={item.action}
                  disabled={uploadingImage}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div
          className={cn(
            "flex items-center justify-between mt-2 text-muted-foreground",
            // Responsive text and spacing
            "mobile:text-xs mobile:mt-1.5",
            "tablet:text-xs mobile:mt-2",
            "desktop:text-sm desktop:mt-2",
          )}
        >
          <span
            className={cn(
              // Hide detailed shortcuts on mobile
              "mobile:hidden",
              "tablet:inline",
              "desktop:inline",
            )}
          >
            Press Ctrl+Enter to send, Shift+Enter for new line, F1 for shortcuts
          </span>
          <span
            className={cn(
              // Simplified text on mobile
              "mobile:inline tablet:hidden desktop:hidden",
            )}
          >
            F1 for shortcuts
          </span>
          <span
            className={cn(uploadingImage ? "text-primary" : "", "mobile:text-xs", "tablet:text-xs", "desktop:text-sm")}
          >
            {uploadingImage ? "Uploading image..." : "AI can make mistakes. Verify important information."}
          </span>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={anyFileInputRef} onChange={handleAnyFileChange} className="hidden" />

      {/* Modals */}
      {isMounted && (
        <>
          {showScreenShareModal && (
            <ScreenShareModal
              isOpen={showScreenShareModal}
              onClose={() => setShowScreenShareModal?.(false)}
              onStream={handleStream}
              onAIAnalysis={(analysis: string) => {
                console.log("Screen Analysis:", analysis)
                addActivity({
                  type: "ai_thinking",
                  title: "Screen Analysis",
                  description: analysis,
                  status: "completed",
                })
              }}
              theme="dark"
            />
          )}

          {showVoiceModal && (
            <VoiceInputModal
              isOpen={showVoiceModal}
              onClose={() => setShowVoiceModal?.(false)}
              onAIResponse={(response: string) => {
                console.log("AI Response:", response)
                handleVoiceTranscript(response)
              }}
              onTransferToChat={(transcript: string) => {
                onVoiceTranscript?.(transcript)
              }}
              theme="dark"
            />
          )}

          {showWebcamModal && (
            <WebcamModal
              isOpen={showWebcamModal}
              onClose={() => setShowWebcamModal?.(false)}
              onCapture={handleWebcamCapture}
              onAIAnalysis={(analysis: string) => {
                console.log("Webcam Analysis:", analysis)
                addActivity({
                  type: "ai_thinking",
                  title: "Vision Analysis",
                  description: analysis,
                  status: "completed",
                })
              }}
              theme="dark"
            />
          )}

          {showVideo2AppModal && (
            <Video2AppModal isOpen={showVideo2AppModal} onClose={() => setShowVideo2AppModal(false)} />
          )}
        </>
      )}
    </div>
  )
}
