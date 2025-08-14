"use client"

import React, { useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Camera, Monitor, FileText, GraduationCap, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare/ScreenShare"
import { EnhancedFileUpload } from "@/components/chat/upload/EnhancedFileUpload"
import WorkshopPanel from "@/components/workshop/WorkshopPanel"
import { ChatDock } from "@/components/chat/ChatDock"
import { StageRail } from "@/components/collab/StageRail"

type Feature = "chat" | "webcam" | "screenshare" | "pdf" | "workshop"

export default function CollabPage() {
  const [feature, setFeature] = useState<Feature>("chat")

  return (
    <SidebarProvider>
      <div className="flex min-h-[100svh]">
        <Sidebar className="border-r">
          <SidebarHeader />
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={feature === "chat"} onClick={() => setFeature("chat")}> <MessageCircle className="mr-2 h-4 w-4"/> Chat</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={feature === "webcam"} onClick={() => setFeature("webcam")}> <Camera className="mr-2 h-4 w-4"/> Webcam</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={feature === "screenshare"} onClick={() => setFeature("screenshare")}> <Monitor className="mr-2 h-4 w-4"/> Screen</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={feature === "pdf"} onClick={() => setFeature("pdf")}> <FileText className="mr-2 h-4 w-4"/> PDF</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={feature === "workshop"} onClick={() => setFeature("workshop")}> <GraduationCap className="mr-2 h-4 w-4"/> Workshop</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter />
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <StageRail />
          <div className="h-12 flex items-center justify-between border-b px-4 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
            <div className="text-sm font-medium capitalize">{feature}</div>
          </div>

          <div className={cn("flex-1 overflow-hidden", "pb-80")}> 
            {feature === "chat" && (
              <div className="h-full grid place-items-center text-muted-foreground">Chat lives in the dock below.</div>
            )}
            {feature === "webcam" && (
              <div className="h-full p-2 md:p-4">
                <div className="h-full rounded-xl border border-border/50 bg-card/60 shadow-xl">
                  <WebcamCapture mode="canvas" onClose={() => setFeature("chat")} onCancel={() => setFeature("chat")} onCapture={() => {}} onAIAnalysis={() => {}} />
                </div>
              </div>
            )}
            {feature === "screenshare" && (
              <div className="h-full p-2 md:p-4">
                <div className="h-full rounded-xl border border-border/50 bg-card/60 shadow-xl">
                  <ScreenShare mode="canvas" onClose={() => setFeature("chat")} onCancel={() => setFeature("chat")} onAnalysis={() => {}} />
                </div>
              </div>
            )}
            {feature === "pdf" && (
              <div className="h-full overflow-auto p-2 md:p-4">
                <div className="rounded-xl border border-border/50 bg-card/60 shadow-xl">
                  <EnhancedFileUpload />
                </div>
              </div>
            )}
            {feature === "workshop" && (
              <div className="h-full overflow-auto p-2 md:p-4">
                <div className="rounded-xl border border-border/50 bg-card/60 shadow-xl">
                  <WorkshopPanel />
                </div>
              </div>
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40">
            <ChatDock />
        </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

