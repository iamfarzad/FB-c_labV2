"use client"

import React, { useState, useCallback, useMemo, Suspense } from "react"
import { Camera, Monitor, FileText, GraduationCap, MessageCircle, Zap, Minimize2, Maximize2, Loader2 } from "lucide-react"
import { cn, uiSpacing } from "@/lib/utils"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare/ScreenShare"
import { EnhancedFileUpload } from "@/components/chat/upload/EnhancedFileUpload"
import WorkshopPanel from "@/components/workshop/WorkshopPanel"
import { StageRail } from "@/components/collab/StageRail"
import { Badge } from "@/components/ui/badge"
import { AIEChat } from "@/components/chat/AIEChat"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

type Feature = "chat" | "webcam" | "screenshare" | "pdf" | "workshop"

interface FeatureConfig {
  id: Feature
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  shortcut?: string
}

const FEATURE_CONFIG: FeatureConfig[] = [
  { id: "chat", icon: MessageCircle, label: "Chat", description: "AI-powered conversation with context awareness", shortcut: "C" },
  { id: "webcam", icon: Camera, label: "Webcam", description: "Capture and analyze video content", shortcut: "W" },
  { id: "screenshare", icon: Monitor, label: "Screen Share", description: "Share and analyze your screen", shortcut: "S" },
  { id: "pdf", icon: FileText, label: "PDF Upload", description: "Upload and process documents", shortcut: "P" },
  { id: "workshop", icon: GraduationCap, label: "Workshop", description: "Interactive learning modules", shortcut: "L" },
]

// Loading skeleton for panel content
const PanelSkeleton = () => (
  <div className="h-full p-4 md:p-6">
    <div className="h-full rounded-xl border border-border bg-card p-4 md:p-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
    </div>
  </div>
)

// Lazy-loaded panel components for better performance
const LazyWebcamPanel = React.lazy(() => Promise.resolve({ default: WebcamCapture }))
const LazyScreenPanel = React.lazy(() => Promise.resolve({ default: ScreenShare }))
const LazyWorkshopPanel = React.lazy(() => Promise.resolve({ default: WorkshopPanel }))

export default function CollabPage() {
  const [feature, setFeature] = useState<Feature>("chat")
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Keyboard shortcuts with improved accessibility
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) return // Don't interfere with browser shortcuts
    
    const feature = FEATURE_CONFIG.find(f => f.shortcut && f.shortcut.toLowerCase() === event.key.toLowerCase())
    if (feature) {
      event.preventDefault()
      handleFeatureSwitch(feature.id)
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Feature switching with loading state and improved UX
  const handleFeatureSwitch = useCallback((newFeature: Feature) => {
    if (newFeature === feature) return
    
    setIsLoading(true)
    setFeature(newFeature)
    
    // Simulate loading for better UX feedback
    setTimeout(() => setIsLoading(false), 300)
  }, [feature])

  // Memoized sidebar items to prevent unnecessary re-renders
  const sidebarItems = useMemo(() => 
    FEATURE_CONFIG.map((item) => {
      const Icon = item.icon
      const active = feature === item.id
      return { ...item, Icon, active }
    }), [feature]
  )

  const SidebarRail = () => (
    <nav 
      className={cn(uiSpacing.sidebar.container, "bg-background border-r flex flex-col")} 
      aria-label="Primary navigation"
      role="navigation"
    >
      <header className="h-16 grid place-items-center border-b">
        <div 
          className="w-8 h-8 bg-primary text-primary-foreground rounded-md grid place-items-center" 
          aria-label="F.B/c AI"
          role="img"
        >
          <Zap className="w-4 h-4" aria-hidden />
        </div>
      </header>
      
      <div 
        className={cn("flex-1", uiSpacing.sidebar.padding, uiSpacing.sidebar.gap)} 
        role="tablist" 
        aria-label="Feature selection"
      >
        {sidebarItems.map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative px-2 group">
                  <button
                    onClick={() => handleFeatureSwitch(item.id)}
                    aria-label={`${item.label}: ${item.description}`}
                    aria-selected={item.active}
                    role="tab"
                    className={cn(
                      "w-14 h-14 rounded-md grid place-items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      item.active 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    title={`${item.label} (${item.shortcut})`}
                  >
                    <item.Icon className="w-5 h-5" aria-hidden />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  {item.shortcut && (
                    <p className="text-xs text-muted-foreground">Shortcut: {item.shortcut}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      {/* Footer actions removed: Plus / Settings (no pipeline yet) */}
    </nav>
  )

  return (
    <div className="flex min-h-[100svh] bg-background">
      <SidebarRail />
      
      <div className="flex-1 flex flex-col">
        <StageRail />
        
        <header 
          className={cn(uiSpacing.header.height, "flex items-center justify-between border-b", uiSpacing.header.padding, "bg-background")} 
          role="banner"
        >
          <div className={cn("flex items-center", uiSpacing.header.gap)}>
            <h1 id="page-title" className="text-sm md:text-base font-medium capitalize tracking-tight">
              {feature}
            </h1>
            {feature !== "chat" && (
              <Badge variant="secondary" className="h-5 bg-primary/10 text-primary">
                Active
              </Badge>
            )}
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" aria-label="Loading" />
            )}
          </div>
          
          {/* Online count removed (no implementation yet) */}
        </header>

        <main 
          className={cn(
            "flex-1 overflow-hidden",
            feature === "chat" ? "pb-0" : (isChatMinimized ? "pb-0" : "pb-[40svh] md:pb-80")
          )} 
          role="main" 
          aria-labelledby="page-title"
          aria-live="polite"
          aria-busy={isLoading}
        > 
          {feature === "chat" && (
            <div className={cn("h-full", uiSpacing.content.padding)}>
              <div className="h-full rounded-xl border border-border bg-card">
                <AIEChat mode="full" />
              </div>
            </div>
          )}
          
          {feature === "webcam" && (
            <Suspense fallback={<PanelSkeleton />}>
              <div className={cn("h-full", uiSpacing.content.padding)}>
                <div className="h-full rounded-xl border border-border bg-card">
                  <WebcamCapture 
                    mode="canvas" 
                    onClose={() => handleFeatureSwitch("chat")} 
                    onCancel={() => handleFeatureSwitch("chat")} 
                    onCapture={() => {}} 
                    onAIAnalysis={() => {}} 
                  />
                </div>
              </div>
            </Suspense>
          )}
          
          {feature === "screenshare" && (
            <Suspense fallback={<PanelSkeleton />}>
              <div className={cn("h-full", uiSpacing.content.padding)}>
                <div className="h-full rounded-xl border border-border bg-card">
                  <ScreenShare 
                    mode="canvas" 
                    onClose={() => handleFeatureSwitch("chat")} 
                    onCancel={() => handleFeatureSwitch("chat")} 
                    onAnalysis={() => {}} 
                  />
                </div>
              </div>
            </Suspense>
          )}
          
          {feature === "pdf" && (
            <div className={cn("h-full overflow-auto", uiSpacing.content.padding)}>
              <div className="rounded-xl border border-border bg-card">
                <EnhancedFileUpload />
              </div>
            </div>
          )}
          
          {feature === "workshop" && (
            <Suspense fallback={<PanelSkeleton />}>
              <div className={cn("h-full overflow-auto", uiSpacing.content.padding)}>
                <div className="rounded-xl border border-border bg-card">
                  <WorkshopPanel />
                </div>
              </div>
            </Suspense>
          )}
        </main>

        {/* Persistent Chat Panel with improved accessibility */}
        {feature !== "chat" && (
          <aside 
            id="collab-chat-panel" 
            className={cn(
              "transition-all duration-300 border-t border-border bg-background",
              isChatMinimized ? "h-12" : "min-h-[40svh] max-h-[60svh] md:h-80"
            )}
            aria-label="Chat panel"
            role="complementary"
          > 
          <div className="h-full flex flex-col">
            <header className={cn(uiSpacing.chat.header, "flex items-center justify-between border-b border-border")}>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" aria-hidden />
                <span className="font-medium text-foreground">Smart Chat</span>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  Context Aware
                </Badge>
              </div>
              
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="p-2 hover:bg-muted rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-controls="collab-chat-panel"
                aria-expanded={!isChatMinimized}
                aria-label={isChatMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isChatMinimized ? (
                  <Maximize2 className="w-4 h-4 text-muted-foreground" aria-hidden />
                ) : (
                  <Minimize2 className="w-4 h-4 text-muted-foreground" aria-hidden />
                )}
              </button>
            </header>
            
            {!isChatMinimized && (
              <div className={cn("flex-1 overflow-hidden", uiSpacing.chat.padding)}>
                <div className="h-full bg-muted/10 border border-border/20 rounded-lg">
                  <AIEChat mode="dock" />
                </div>
              </div>
            )}
          </div>
        </aside>
        )}
      </div>
    </div>
  )
}

