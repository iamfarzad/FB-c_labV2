"use client"

import React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Camera, Monitor, Mic, MicOff, Paperclip, FileText, Image as ImageIcon, Youtube, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatContext } from "../../../app/chat/context/ChatProvider"
import { ScreenShareModal } from "../modals/ScreenShareModal"
import { VoiceInputModal } from "../modals/VoiceInputModal"
import { WebcamModal } from "../modals/WebcamModal"
import { Video2AppModal } from "../modals/Video2AppModal"

interface ChatFooterProps {
  input: string
  setInput: (value: string) => void
  onSendMessage: () => void
  isLoading: boolean
  onKeyPress: (e: React.KeyboardEvent) => void
}

export function ChatFooter({ input, setInput, onSendMessage, isLoading, onKeyPress }: ChatFooterProps) {
  const { addActivity } = useChatContext();
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [showScreenShareModal, setShowScreenShareModal] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showWebcamModal, setShowWebcamModal] = useState(false)
  const [showVideo2AppModal, setShowVideo2AppModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const anyFileInputRef = useRef<HTMLInputElement>(null)

  const uploadMenuItems = [
    {
      id: 'image',
      label: 'Upload Image',
      icon: ImageIcon,
      action: () => {
        fileInputRef.current?.click()
        setShowUploadOptions(false)
      }
    },
    {
      id: 'file',
      label: 'Upload File',
      icon: FileText,
      action: () => {
        anyFileInputRef.current?.click()
        setShowUploadOptions(false)
      }
    },
    {
      id: 'youtube',
      label: 'YouTube Video',
      icon: Youtube,
      action: () => {
        setInput(input + (input ? ' ' : '') + 'https://youtube.com/watch?v=')
        setShowUploadOptions(false)
        addActivity({
          type: 'link',
          title: 'YouTube Video Ready',
          description: 'Paste your YouTube URL to analyze the video',
          status: 'pending'
        })
      }
    }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        // Handle image upload
        addActivity({
          type: 'image',
          title: 'Image Uploaded',
          description: `Uploaded ${file.name}`,
          status: 'completed'
        })
        console.log('Image uploaded:', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      addActivity({
        type: 'document_analysis',
        title: 'File Uploaded',
        description: `Uploaded ${file.name}`,
        status: 'in_progress'
      })
      console.log('File uploaded:', file.name)
    }
  }

  // Handle screen share stream
  const handleStream = (stream: MediaStream) => {
    addActivity({
      type: 'screen_share',
      title: 'Screen Sharing Started',
      description: 'Sharing your screen with the AI assistant',
      status: 'in_progress'
    })
    
    // Capture a screenshot from the stream
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()

    video.onloadedmetadata = () => {
      setTimeout(() => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(video, 0, 0)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        // Add screen analysis message
        setInput(input + (input ? '\n\n' : '') + '🖥️ **Screen Captured for Analysis**\n\nPlease analyze what you see on my screen and provide insights.')
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop())
      }, 1000)
    }
  }

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setInput(input + (input ? ' ' : '') + transcript)
    addActivity({
      type: 'voice_input',
      title: 'Voice Input Received',
      description: 'Transcribed voice to text',
      status: 'completed'
    })
  }

  // Handle webcam capture
  const handleWebcamCapture = (imageData: string) => {
    addActivity({
      type: 'image',
      title: 'Photo Captured',
      description: 'Captured photo from webcam',
      status: 'completed'
    })
    
    // Add message about the captured image
    setInput(input + (input ? '\n\n' : '') + '📸 **Photo Captured**\n\nPlease analyze this image I just took.')
    console.log('Webcam image captured')
  }

  return (
    <div className="border-t border-border p-4">
      <div className="max-w-3xl mx-auto">
        {/* Input Form */}
        <div className="flex items-end gap-2 relative">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder="Type your message... (Use / for commands)"
              className="min-h-[60px] max-h-[200px] resize-none pr-24"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                className="w-8 h-8"
                title="Upload files"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWebcamModal(true)}
                className={cn(
                  "w-8 h-8 transition-colors",
                  isCameraActive && "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                )}
                title="Open camera"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowScreenShareModal(true)}
                className="w-8 h-8"
                title="Share screen"
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceModal(true)}
                className={cn(
                  "w-8 h-8 transition-colors",
                  isRecording && "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                )}
                title="Voice input"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVideo2AppModal(true)}
                className="w-8 h-8"
                title="Video to Learning App"
              >
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={onSendMessage}
            disabled={(!input.trim()) || isLoading}
            className="h-[60px] px-6"
          >
            <Send className="w-4 h-4" />
          </Button>

          {/* Upload Options Dropdown */}
          {showUploadOptions && (
            <div className="absolute bottom-16 right-4 bg-popover border rounded-md shadow-md p-1 z-50 min-w-[160px]">
              {uploadMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-8 px-2 py-1.5 text-sm font-normal hover:bg-accent hover:text-accent-foreground"
                  onClick={item.action}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>AI can make mistakes. Verify important information.</span>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <input
        type="file"
        ref={anyFileInputRef}
        onChange={handleAnyFileChange}
        className="hidden"
      />

      {/* Modals */}
      <ScreenShareModal
        isOpen={showScreenShareModal}
        onClose={() => setShowScreenShareModal(false)}
        onStream={handleStream}
      />

      <VoiceInputModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTranscript={handleVoiceTranscript}
      />

      <WebcamModal
        isOpen={showWebcamModal}
        onClose={() => setShowWebcamModal(false)}
        onCapture={handleWebcamCapture}
      />

      <Video2AppModal
        isOpen={showVideo2AppModal}
        onClose={() => setShowVideo2AppModal(false)}
      />
    </div>
  )
}
