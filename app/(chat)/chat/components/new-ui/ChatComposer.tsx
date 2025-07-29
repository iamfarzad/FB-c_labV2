"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Camera,
  Plus,
  Keyboard,
  Sparkles,
  ImageIcon,
  FileText,
  Zap,
  BarChart,
  Search,
  DollarSign,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ChatComposerProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
}

export function ChatComposer({ onSendMessage, isLoading }: ChatComposerProps) {
  const [message, setMessage] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
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
    { text: "Analyze my business metrics", icon: BarChart },
    { text: "Generate a lead research report", icon: Search },
    { text: "Calculate ROI for my campaign", icon: DollarSign },
    { text: "Schedule a client meeting", icon: Calendar },
  ]

  const commonEmojis = ["😊", "👍", "🎉", "💡", "🚀", "📊", "💰", "🎯", "📈", "🔥", "⭐", "✅", "❤️", "👏", "🙌", "💪"]

  const insertEmoji = (emoji: string) => {
    const newMessage = message + emoji
    setMessage(newMessage)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  return (
    <div className="p-6 space-y-4">
      {/* Quick Prompts - Enhanced with better emoji rendering */}
      {message === "" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Prompts</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setMessage(prompt.text)}
                className="shrink-0 text-sm h-8 px-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-sm font-medium"
              >
                <prompt.icon className="h-4 w-4 mr-2 text-gray-400" />
                {prompt.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area - Refined design */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div
            className={`relative rounded-2xl border-2 transition-all duration-300 ${
              message.trim()
                ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            } shadow-sm hover:shadow-md ${isExpanded ? "rounded-2xl" : "rounded-full"}`}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your business... ✨"
              className={`min-h-[48px] max-h-[120px] resize-none border-0 bg-transparent px-6 py-4 pr-24 text-sm placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                isExpanded ? "rounded-2xl" : "rounded-full"
              }`}
              disabled={isLoading}
            />

            {/* Enhanced Action Buttons */}
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Attach files</p>
                  </TooltipContent>
                </Tooltip>

                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          disabled={isLoading}
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add emoji</p>
                      </TooltipContent>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="end">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Quick Emojis</div>
                      <div className="grid grid-cols-8 gap-2">
                        {commonEmojis.map((emoji, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            onClick={() => insertEmoji(emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">Voice</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voice input (Coming soon)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">Camera</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Camera input</p>
                </TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">More</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Upload Image
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <FileText className="h-4 w-4" />
                      Upload Document
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Keyboard className="h-3 w-3" />
              <span>Enter to send • Shift+Enter for new line</span>
            </div>

            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="h-9 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm">Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-3.5 w-3.5" />
                  <span className="text-sm">Send</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Character Count and Status */}
        {message.length > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {message.length > 500 && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                  Long message
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {message.length} characters
            </Badge>
          </div>
        )}
      </form>
    </div>
  )
}
