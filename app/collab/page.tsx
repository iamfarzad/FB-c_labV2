"use client"

import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { MessageCircle, Camera, Monitor, FileText, GraduationCap, Moon, Sun, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare/ScreenShare"
import { ROICalculator } from "@/components/chat/tools/ROICalculator/ROICalculator"
import WorkshopPanel from "@/components/workshop/WorkshopPanel"
import { StageRail } from "@/components/collab/StageRail"
import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"
import type { UnifiedMessage } from "@/components/chat/unified/UnifiedChatInterface"

export type FeatureType = "chat" | "webcam" | "screenshare" | "pdf" | "workshop"

export default function CollabPage() {
  const [feature, setFeature] = useState<FeatureType>("chat")
  const [messages, setMessages] = useState<UnifiedMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showProgressRail, setShowProgressRail] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const toolItems = [
    { id: 'webcam' as FeatureType, icon: Camera, label: 'Webcam Capture', shortcut: 'W' },
    { id: 'screenshare' as FeatureType, icon: Monitor, label: 'Screen Share', shortcut: 'S' },
    { id: 'pdf' as FeatureType, icon: FileText, label: 'ROI Calculator', shortcut: 'P' },
    { id: 'workshop' as FeatureType, icon: GraduationCap, label: 'Workshop', shortcut: 'L' }
  ]

  useEffect(() => {
    // Initialize session from localStorage
    const storedSessionId = localStorage.getItem('intelligence-session-id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    }
  }, [])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: UnifiedMessage = {
      id: `msg-${Date.now()}`,
      content,
      role: 'user',
      metadata: {
        timestamp: new Date()
      }
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId
        })
      })

      if (!response.ok) throw new Error('Chat request failed')

      const data = await response.json()
      
      const assistantMessage: UnifiedMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.content || data.message || '',
        metadata: {
          timestamp: new Date(),
          sources: data.sources,
          citations: data.citations,
          suggestions: data.suggestions
        }
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearMessages = () => {
    setMessages([])
  }

  const handleToolSelect = (toolId: FeatureType) => {
    setFeature(toolId)
    if (toolId !== 'chat') {
      setShowProgressRail(true)
    }
  }

  const handleToolAction = (tool: string, data?: any) => {
    console.log('Tool action:', tool, data)
    // Handle tool actions
    switch(tool) {
      case 'webcam':
        setFeature('webcam')
        break
      case 'screen':
        setFeature('screenshare')
        break
      case 'roi':
        setFeature('pdf')
        break
      case 'video':
        // Video tool handling
        break
    }
  }

  const renderChatInterface = () => (
    <UnifiedChatInterface
      messages={messages}
      isLoading={isLoading}
      sessionId={sessionId}
      mode="dock"
      onSendMessage={handleSendMessage}
      onClearMessages={handleClearMessages}
      onToolAction={handleToolAction}
      className="h-full"
    />
  )

  const renderToolPanel = () => {
    switch (feature) {
      case 'webcam':
        return (
          <div className="h-full">
            <WebcamCapture 
              mode="canvas" 
              onClose={() => handleToolSelect("chat")} 
              onCancel={() => handleToolSelect("chat")} 
              onCapture={() => {}} 
              onAIAnalysis={() => {}} 
            />
          </div>
        )
      case 'screenshare':
        return (
          <div className="h-full">
            <ScreenShare 
              mode="canvas" 
              onClose={() => handleToolSelect("chat")} 
              onCancel={() => handleToolSelect("chat")} 
              onAnalysis={() => {}} 
            />
          </div>
        )
      case 'pdf':
        return (
          <div className="h-full overflow-auto p-6">
            <ROICalculator 
              mode="card" 
              onClose={() => handleToolSelect("chat")} 
              onCancel={() => handleToolSelect("chat")} 
              onComplete={(result) => {
                console.log('ROI calculation completed:', result)
              }}
            />
          </div>
        )
      case 'workshop':
        return (
          <div className="h-full">
            <WorkshopPanel />
          </div>
        )
      default:
        return renderChatInterface()
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      
      switch (e.key.toLowerCase()) {
        case 'c':
          setFeature('chat')
          setShowProgressRail(false)
          break
        case 'w':
          handleToolSelect('webcam')
          break
        case 's':
          handleToolSelect('screenshare')
          break
        case 'p':
          handleToolSelect('pdf')
          break
        case 'l':
          handleToolSelect('workshop')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <TooltipProvider>
      <div className={cn("h-screen w-full bg-background flex overflow-hidden", isDarkMode && "dark")}>
        {/* Left Sidebar */}
        <div className="w-16 bg-background border-r border-border/50 flex flex-col py-4">
          {/* Logo/Brand */}
          <div className="px-4 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">C</span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-col gap-2 px-2 flex-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={feature === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={() => {
                    setFeature('chat')
                    setShowProgressRail(false)
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <span>Chat</span>
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">C</kbd>
                </div>
              </TooltipContent>
            </Tooltip>
            
            {toolItems.map((tool) => {
              const Icon = tool.icon
              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={feature === tool.id ? 'default' : 'ghost'}
                      size="sm"
                      className="w-12 h-12 p-0"
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="flex items-center gap-2">
                      <span>{tool.label}</span>
                      <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">{tool.shortcut}</kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
          
          {/* Settings */}
          <div className="px-2 space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={() => setShowProgressRail(!showProgressRail)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Settings</span>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span>Toggle theme</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1">
            {/* Header */}
            {feature !== 'chat' && (
              <header className="h-14 border-b border-border/50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-medium">
                    {toolItems.find(t => t.id === feature)?.label || feature}
                  </h1>
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFeature('chat')
                    setShowProgressRail(false)
                  }}
                >
                  Back to Chat
                </Button>
              </header>
            )}

            {/* Main Panel */}
            <main className={cn(
              "overflow-hidden",
              feature === 'chat' ? "h-full" : "h-[calc(100vh-3.5rem)]"
            )}>
              {renderToolPanel()}
            </main>
          </div>

          {/* Progress Rail */}
          {showProgressRail && (
            <div className="w-20">
              <StageRail />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
