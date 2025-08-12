"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Plus, FileText, ImageIcon, Camera, Monitor, Calculator, Video } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"

export interface ToolMenuProps {
  onUploadDocument?: () => void
  onUploadImage?: () => void
  onWebcam?: () => void
  onScreenShare?: () => void
  onROI?: () => void
  onVideoToApp?: () => void
  disabled?: boolean
  className?: string
}

export function ToolMenu({
  onUploadDocument,
  onUploadImage,
  onWebcam,
  onScreenShare,
  onROI,
  onVideoToApp,
  disabled,
  className,
}: ToolMenuProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
          type="button"
          variant="ghost"
          size="touch"
          disabled={disabled}
          className={cn(
            "h-8 w-8 rounded-full border border-border/30 bg-muted/40",
            "hover:bg-accent/10 hover:border-accent/30",
            className
          )}
          aria-label="Open tools"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Tools</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-56">
        {onUploadDocument && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onUploadDocument}>
            <FileText className="w-4 h-4" /> Upload document
          </DropdownMenuItem>
        )}
        {onUploadImage && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onUploadImage}>
            <ImageIcon className="w-4 h-4" /> Upload image
          </DropdownMenuItem>
        )}
        {onWebcam && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onWebcam}>
            <Camera className="w-4 h-4" /> Webcam capture
          </DropdownMenuItem>
        )}
        {onScreenShare && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onScreenShare}>
            <Monitor className="w-4 h-4" /> Screen share
          </DropdownMenuItem>
        )}
        {onROI && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onROI}>
            <Calculator className="w-4 h-4" /> ROI calculator
          </DropdownMenuItem>
        )}
        {onVideoToApp && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onVideoToApp}>
            <Video className="w-4 h-4" /> Video → App
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ToolMenu


