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
  comingSoon?: Array<'document' | 'image' | 'webcam' | 'screen' | 'video'>
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
  comingSoon = [],
}: ToolMenuProps) {
  const contentId = React.useId()
  const menuId = `tool-menu-${contentId.replace(/[:]/g, '-')}`
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
          aria-haspopup="menu"
          aria-controls={menuId}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Tools</TooltipContent>
      </Tooltip>
      <DropdownMenuContent id={menuId} align="start" className="w-56" aria-label="Tools menu">
        {onUploadDocument && (
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={comingSoon.includes('document') ? undefined : onUploadDocument}
            disabled={comingSoon.includes('document')}
          >
            <FileText className="w-4 h-4" /> Upload document{comingSoon.includes('document') ? ' (coming soon)' : ''}
          </DropdownMenuItem>
        )}
        {onUploadImage && (
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={comingSoon.includes('image') ? undefined : onUploadImage}
            disabled={comingSoon.includes('image')}
          >
            <ImageIcon className="w-4 h-4" /> Upload image{comingSoon.includes('image') ? ' (coming soon)' : ''}
          </DropdownMenuItem>
        )}
        {onWebcam && (
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={comingSoon.includes('webcam') ? undefined : onWebcam}
            disabled={comingSoon.includes('webcam')}
          >
            <Camera className="w-4 h-4" /> Webcam capture{comingSoon.includes('webcam') ? ' (coming soon)' : ''}
          </DropdownMenuItem>
        )}
        {onScreenShare && (
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={comingSoon.includes('screen') ? undefined : onScreenShare}
            disabled={comingSoon.includes('screen')}
          >
            <Monitor className="w-4 h-4" /> Screen share{comingSoon.includes('screen') ? ' (coming soon)' : ''}
          </DropdownMenuItem>
        )}
        {onROI && (
          <DropdownMenuItem className="gap-3 cursor-pointer" onClick={onROI}>
            <Calculator className="w-4 h-4" /> ROI calculator
          </DropdownMenuItem>
        )}
        {onVideoToApp && (
          <DropdownMenuItem
            className="gap-3 cursor-pointer"
            onClick={comingSoon.includes('video') ? undefined : onVideoToApp}
            disabled={comingSoon.includes('video')}
          >
            <Video className="w-4 h-4" /> Video → App{comingSoon.includes('video') ? ' (coming soon)' : ''}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ToolMenu


