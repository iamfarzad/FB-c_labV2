"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Paperclip, ImageIcon, Mic, Video, ScreenShare, Calculator, Plus, FileText, Camera, Monitor, Zap } from "lucide-react"
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

  const quickActions = [
    { name: "Upload Document", icon: FileText, onClick: handleFileClick, color: "text-blue-500" },
    { name: "Upload Image", icon: ImageIcon, onClick: handleImageClick, color: "text-green-500" },
  ]

  const advancedTools = [
    { name: "Voice Input", icon: Mic, onClick: () => openModal("voiceInput"), color: "text-purple-500" },
    { name: "Webcam Capture", icon: Camera, onClick: () => openModal("webcam"), color: "text-pink-500" },
    { name: "Screen Share", icon: Monitor, onClick: () => openModal("screenShare"), color: "text-indigo-500" },
    { name: "Video to App", icon: Video, onClick: () => openModal("videoToApp"), color: "text-orange-500" },
    { name: "ROI Calculator", icon: Calculator, onClick: () => openModal("roiCalculator"), color: "text-teal-500" },
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
        
        {/* Quick Action Buttons */}
        {quickActions.map((action) => (
          <Tooltip key={action.name}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={action.onClick} aria-label={action.name}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Advanced Tools Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More tools">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>More tools</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-48">
            {advancedTools.map((tool) => (
              <DropdownMenuItem key={tool.name} onClick={tool.onClick} className="gap-3">
                <tool.icon className={`w-4 h-4 ${tool.color}`} />
                <span>{tool.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  )
}
