"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Camera,
  Monitor,
  GraduationCap,
  Users,
  Zap,
  Settings,
  Plus,
  Minimize2,
  Maximize2,
  FileText,
  Play,
} from "lucide-react"
import { useUsers, useFeatureStatus, useNotifications, useActivity } from "@/contexts/app-context"
import { NotificationCenter } from "@/components/shared/notification-center"
import { PersistentChat } from "@/components/shared/persistent-chat"
import { WebcamPanel } from "@/components/panels/webcam-panel"
import { ScreensharePanel } from "@/components/panels/screenshare-panel"
import { WorkshopPanel } from "@/components/panels/workshop-panel"
import { PDFPanel } from "@/components/panels/pdf-panel"
import { LearningPanel } from "@/components/panels/learning-panel"
import { ThemeToggle } from "@/components/theme-toggle"

type FeatureType = "home" | "chat" | "webcam" | "screenshare" | "workshop" | "pdf" | "learning"

export default function UnifiedDashboard() {
  const [activeFeature, setActiveFeature] = useState<FeatureType>("home")
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const { updateCurrentUserFeature, onlineUsers } = useUsers()
  const { activeFeatures } = useFeatureStatus()
  const { addNotification } = useNotifications()
  const { addActivity } = useActivity()

  const sidebarItems = [
    {
      id: "home" as FeatureType,
      icon: Zap,
      label: "Home",
      color: "text-primary",
    },
    {
      id: "chat" as FeatureType,
      icon: MessageCircle,
      label: "Chat",
      color: "text-blue-600",
      count: activeFeatures.chat.participants,
    },
    {
      id: "webcam" as FeatureType,
      icon: Camera,
      label: "Video",
      color: "text-green-600",
      count: activeFeatures.webcam.participants,
    },
    {
      id: "screenshare" as FeatureType,
      icon: Monitor,
      label: "Screen",
      color: "text-amber-600",
      count: activeFeatures.screenshare.viewers,
    },
    {
      id: "workshop" as FeatureType,
      icon: GraduationCap,
      label: "Workshop",
      color: "text-indigo-600",
      count: activeFeatures.workshop.participants,
    },
    {
      id: "pdf" as FeatureType,
      icon: FileText,
      label: "PDF Editor",
      color: "text-red-600",
    },
    {
      id: "learning" as FeatureType,
      icon: Play,
      label: "Video to Learning App",
      color: "text-teal-600",
    },
  ]

  const handleFeatureChange = (featureId: FeatureType) => {
    setActiveFeature(featureId)
    if (featureId !== "home") {
      updateCurrentUserFeature(featureId as any)
      addActivity({
        userId: "current-user",
        userName: "You",
        action: `opened ${featureId}`,
        feature: featureId,
      })
      addNotification({
        type: "info",
        title: `${featureId} Opened`,
        message: `You are now using ${featureId}`,
        feature: featureId,
      })
    }
  }

  const renderMainContent = () => {
    switch (activeFeature) {
      case "webcam":
        return <WebcamPanel />
      case "screenshare":
        return <ScreensharePanel />
      case "workshop":
        return <WorkshopPanel />
      case "pdf":
        return <PDFPanel />
      case "learning":
        return <LearningPanel />
      case "chat":
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted" />
              <p className="text-lg">Chat is always available at the bottom</p>
              <p className="text-sm">Use the persistent chat below to communicate</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to F.B/c AI</h1>
                <p className="text-xl text-muted-foreground">
                  Your unified AI-powered workspace for collaboration. Select a tool from the sidebar to get started.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {sidebarItems.slice(1).map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.id}
                      className="card-minimal cursor-pointer hover:shadow-[var(--shadow-elevated)] transition-all duration-200 hover:-translate-y-1"
                      onClick={() => handleFeatureChange(item.id)}
                    >
                      <div className="p-6 text-center">
                        <Icon className={`w-12 h-12 mx-auto mb-3 ${item.color}`} />
                        <h3 className="font-semibold text-foreground mb-2">{item.label}</h3>
                        {item.count !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {item.count} active
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-primary rounded-[var(--border-radius-medium)] p-6 text-primary-foreground text-center shadow-[var(--shadow-elevated)]">
                <h3 className="text-xl font-bold mb-2">Ready to collaborate with AI?</h3>
                <p className="text-primary-foreground/80 mb-4">
                  All tools are context-aware and work together seamlessly
                </p>
                <button className="btn-secondary" onClick={() => handleFeatureChange("webcam")}>
                  Start with Video
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <div className="w-8 h-8 bg-primary rounded-[var(--border-radius-medium)] flex items-center justify-center shadow-[var(--shadow-minimal)]">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeFeature === item.id
            return (
              <div key={item.id} className="relative px-2 mb-2">
                <button
                  onClick={() => handleFeatureChange(item.id)}
                  className={`w-12 h-12 rounded-[var(--border-radius-medium)] flex items-center justify-center transition-all duration-200 relative group ${
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                  {item.count !== undefined && item.count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center shadow-[var(--shadow-minimal)]">
                      {item.count}
                    </div>
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-sm px-2 py-1 rounded-[var(--border-radius-minimal)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-[var(--shadow-elevated)]">
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-border p-2">
          <div className="mb-2">
            <ThemeToggle />
          </div>
          <button className="w-12 h-12 rounded-[var(--border-radius-medium)] flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200">
            <Plus className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-[var(--border-radius-medium)] flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 mt-2">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground capitalize">
              {activeFeature === "home" ? "Dashboard" : activeFeature}
            </h2>
            {activeFeature !== "home" && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-muted-foreground border-border">
              <Users className="w-3 h-3 mr-1" />
              {onlineUsers.length} online
            </Badge>
            <NotificationCenter />
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 overflow-hidden ${isChatMinimized ? "" : "pb-80"}`}>{renderMainContent()}</div>

        {/* Persistent Chat */}
        <div className={`transition-all duration-300 ${isChatMinimized ? "h-12" : "h-80"}`}>
          <div className="h-full bg-card border-t border-border">
            {/* Chat Header */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Smart Chat</span>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  Context Aware
                </Badge>
              </div>
              <button
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                className="p-1 hover:bg-muted rounded-[var(--border-radius-minimal)] transition-colors"
              >
                {isChatMinimized ? (
                  <Maximize2 className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Chat Content */}
            {!isChatMinimized && (
              <div className="h-68">
                <PersistentChat currentFeature={activeFeature} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
