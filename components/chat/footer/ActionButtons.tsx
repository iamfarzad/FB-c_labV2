"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Paperclip, ImageIcon, Mic, Video, ScreenShare, Calculator } from "lucide-react"
import type { ModalType } from "@/app/(chat)/chat/hooks/useModalManager"

interface ActionButtonsProps {
  onFileUpload: (file: File) => void
  onImageUpload: (imageData: string, fileName: string) => void
  openModal: (modal: ModalType) => void
}

export function ActionButtons({ onFileUpload, onImageUpload, openModal }: ActionButtonsProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileClick = () => fileInputRef.current?.click()
  const handleImageClick = () => imageInputRef.current?.click()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageUpload(reader.result as string, file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const tooltips = [
    { name: "Attach File", icon: Paperclip, onClick: handleFileClick },
    { name: "Upload Image", icon: ImageIcon, onClick: handleImageClick },
    { name: "Voice Input", icon: Mic, onClick: () => openModal("voiceInput") },
    { name: "Video to App", icon: Video, onClick: () => openModal("videoToApp") },
    { name: "Share Screen", icon: ScreenShare, onClick: () => openModal("screenShare") },
    { name: "ROI Calculator", icon: Calculator, onClick: () => openModal("roiCalculator") },
  ]

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" aria-hidden="true" />
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
          aria-hidden="true"
        />
        {tooltips.map((tip) => (
          <Tooltip key={tip.name}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={tip.onClick} aria-label={tip.name}>
                <tip.icon className="w-5 h-5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tip.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
