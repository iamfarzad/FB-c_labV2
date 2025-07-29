"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, Mic, Camera, Plus, Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatComposer({ onSendMessage, isLoading }: ChatComposerProps) {
  const [message, setMessage] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage("")
      setIsExpanded(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
      setIsExpanded(scrollHeight > 44)
    }
  }, [message])

  const quickPrompts = [
    "Analyze my business metrics",
    "Generate a lead research report",
    "Calculate ROI for my campaign",
    "Schedule a client meeting",
  ]

  return (
    <div className="p-4 space-y-3">
      {/* Quick Prompts */}
      {message === "" && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setMessage(prompt)}
              className="shrink-0 text-xs h-7 px-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}

      {/* Main Input Area */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div
            className={`relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-200 ${
              isExpanded ? "rounded-2xl" : "rounded-full"
            } ${message.trim() ? "ring-2 ring-blue-500/20" : ""}`}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your business... (Press Enter to send)"
              className={`min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent px-4 py-3 pr-20 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                isExpanded ? "rounded-2xl" : "rounded-full"
              }`}
              disabled={isLoading}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      disabled={isLoading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach files</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                      disabled={isLoading}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add emoji</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    disabled={isLoading}
                  >
                    <Mic className="h-3 w-3" />
                    <span className="text-xs">Voice</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice input</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    disabled={isLoading}
                  >
                    <Camera className="h-3 w-3" />
                    <span className="text-xs">Camera</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Camera input</p>
                </TooltipContent>
              </Tooltip>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                disabled={isLoading}
              >
                <Plus className="h-3 w-3" />
                <span className="text-xs">More</span>
              </Button>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Keyboard className="h-3 w-3" />
              <span>Enter to send</span>
            </div>

            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="h-8 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs">Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-3 w-3" />
                  <span className="text-xs">Send</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Character Count */}
        {message.length > 0 && (
          <div className="flex justify-end">
            <Badge variant="secondary" className="text-xs">
              {message.length} characters
            </Badge>
          </div>
        )}
      </form>
    </div>
  )
}
