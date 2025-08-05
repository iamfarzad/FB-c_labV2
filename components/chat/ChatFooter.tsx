"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Send, Camera, Mic, Paperclip, Play, Calculator, Monitor, Plus, X, 
  Sparkles, Zap, FileText, ImageIcon, ChevronDown, Settings
} from 'lucide-react'

// Hooks and Utils
import { useToast } from '@/hooks/use-toast'
import { cn } from "@/lib/utils"

// External Libraries
import { motion, AnimatePresence } from "framer-motion"

interface ChatFooterProps {
  input: string
  setInput: (value: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onFileUpload?: (file: File) => void
  onImageUpload?: (imageData: string, fileName: string) => void
  onVoiceTranscript?: (transcript: string) => void
  onToolComplete?: (toolId: string, result: any) => void
  inputRef?: React.RefObject<HTMLTextAreaElement>
}

// Unified tool configuration
const UNIFIED_TOOLS = [
  {
    id: 'voice',
    name: 'Voice Input',
    description: 'Speak your message',
    icon: Mic,
    color: 'from-purple-500 to-purple-600',
    shortcut: 'Ctrl+Shift+V'
  },
  {
    id: 'multimodal',
    name: 'Multimodal AI',
    description: 'Voice, webcam, and screen sharing',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    shortcut: 'Ctrl+Shift+M'
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Calculate automation ROI',
    icon: Calculator,
    color: 'from-green-500 to-green-600',
    shortcut: 'Ctrl+Shift+R'
  },
  {
    id: 'video2app',
    name: 'Video to App',
    description: 'Convert videos to apps',
    icon: Play,
    color: 'from-orange-500 to-orange-600',
    shortcut: 'Ctrl+Shift+A'
  }
]

export function ChatFooter({
  input,
  setInput,
  handleInputChange,
  handleSubmit,
  isLoading,
  onFileUpload,
  onImageUpload,
  onVoiceTranscript,
  onToolComplete,
  inputRef
}: ChatFooterProps) {
  const { toast } = useToast()
  const [isComposing, setIsComposing] = useState(false)
  const [showToolMenu, setShowToolMenu] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        handleSubmit(e as any)
      }
    }
    if (e.key === 'Escape') {
      e.currentTarget.blur()
      setActiveTool(null)
    }
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file)
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`
      })
    }
    if (event.target) {
      event.target.value = ''
    }
  }, [onFileUpload, toast])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpload) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result, file.name)
        toast({
          title: "Image uploaded",
          description: `${file.name} has been uploaded successfully.`
        })
      }
      reader.readAsDataURL(file)
    }
    if (event.target) {
      event.target.value = ''
    }
  }, [onImageUpload, toast])

  const handleToolSelect = useCallback((toolId: string) => {
    setActiveTool(toolId)
    setShowToolMenu(false)
    
    // Show tool-specific feedback
    const tool = UNIFIED_TOOLS.find(t => t.id === toolId)
    if (tool) {
      toast({
        title: `${tool.name} activated`,
        description: tool.description
      })
    }
  }, [toast])

  const handleToolComplete = useCallback((toolId: string, result: any) => {
    setActiveTool(null)
    onToolComplete?.(toolId, result)
    
    // Show completion feedback
    const tool = UNIFIED_TOOLS.find(t => t.id === toolId)
    if (tool) {
      toast({
        title: `${tool.name} completed`,
        description: "Result has been processed successfully."
      })
    }
  }, [onToolComplete, toast])

  // Quick action buttons for most common tools
  const quickActions = [
    {
      id: 'voice',
      icon: Mic,
      label: 'Voice',
      color: 'from-purple-500 to-purple-600',
      onClick: () => handleToolSelect('voice')
    },
    {
      id: 'multimodal',
      icon: Sparkles,
      label: 'AI',
      color: 'from-blue-500 to-blue-600',
      onClick: () => handleToolSelect('multimodal')
    },
    {
      id: 'roi',
      icon: Calculator,
      label: 'ROI',
      color: 'from-green-500 to-green-600',
      onClick: () => handleToolSelect('roi')
    }
  ]

  return (
    <div className="space-y-4">
      {/* Active Tool Display */}
      {activeTool && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 bg-muted/50 rounded-lg border border-border/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const tool = UNIFIED_TOOLS.find(t => t.id === activeTool)
                const Icon = tool?.icon || Settings
                return (
                  <>
                    <div className={`p-1 rounded bg-gradient-to-r ${tool?.color || 'from-gray-500 to-gray-600'}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{tool?.name || 'Tool'}</span>
                  </>
                )
              })()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTool(null)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        {/* Quick Action Buttons */}
        <div className="flex gap-1">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              disabled={isLoading}
              className={cn(
                "h-8 w-8 p-0",
                activeTool === action.id && "ring-2 ring-accent"
              )}
              aria-label={action.label}
            >
              <action.icon className="w-4 h-4" />
            </Button>
          ))}
          
          {/* More Tools Dropdown */}
          <DropdownMenu open={showToolMenu} onOpenChange={setShowToolMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="h-8 w-8 p-0"
                aria-label="More tools"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {UNIFIED_TOOLS.map((tool) => (
                <DropdownMenuItem
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className="flex items-center gap-3"
                >
                  <div className={`p-1 rounded bg-gradient-to-r ${tool.color}`}>
                    <tool.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tool.shortcut}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* File Upload Buttons */}
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !onFileUpload}
            className="h-8 w-8 p-0"
            aria-label="Upload document"
          >
            <FileText className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading || !onImageUpload}
            className="h-8 w-8 p-0"
            aria-label="Upload image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef || inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message or use AI tools..."
            className={cn(
              "min-h-[44px] max-h-32 resize-none",
              "pr-12", // Space for send button
              "border-border/50 focus:border-border",
              "bg-background/95 backdrop-blur-sm"
            )}
            disabled={isLoading}
          />
          
          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              if (input.trim() && !isLoading) {
                handleSubmit(e as any)
              }
            }}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 bottom-2",
              "h-8 w-8 p-0",
              "transition-all duration-200",
              input.trim() && !isLoading
                ? "opacity-100 scale-100"
                : "opacity-50 scale-95"
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span>AI is thinking...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeTool && (
            <Badge variant="secondary" className="text-xs">
              {UNIFIED_TOOLS.find(t => t.id === activeTool)?.name}
            </Badge>
          )}
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  )
}
