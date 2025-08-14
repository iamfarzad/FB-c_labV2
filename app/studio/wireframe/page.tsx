"use client"

import React, { useState } from "react"
import { StudioLayout } from "@/components/studio/StudioLayout"
import { AIEChat } from "@/components/chat/AIEChat"
import WorkshopPanel from "@/components/workshop/WorkshopPanel"
import { LeadProgressIndicator } from "@/components/chat/LeadProgressIndicator"
import { useCanvas } from "@/components/providers/canvas-provider"
import { Button } from "@/components/ui/button"
import { Camera, Monitor, Video, FileText } from "lucide-react"
import { WebcamCapture } from "@/components/chat/tools/WebcamCapture/WebcamCapture"
import { ScreenShare } from "@/components/chat/tools/ScreenShare/ScreenShare"
import { EnhancedFileUpload } from "@/components/chat/upload/EnhancedFileUpload"

function LeftSidebar() {
  return (
    <div className="p-3 text-sm">
      <div className="mb-2 font-medium">Conversations</div>
      <ul className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="rounded-md px-2 py-1 hover:bg-muted/60 cursor-default truncate">
            Session {i + 1}
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-md border bg-card/60 px-2 py-1 text-xs text-muted-foreground">New chat</div>
    </div>
  )
}

function RightSections() {
  return (
    <div className="p-3 text-sm">
      <div className="mb-2 font-medium">Progress</div>
      <div className="rounded-md border">
        <LeadProgressIndicator currentStage={1 as any} variant="rail" />
      </div>
    </div>
  )
}

export default function StudioWireframePage() {
  const [tab, setTab] = useState<'chat' | 'build' | 'learn'>('chat')
  const [activeTool, setActiveTool] = useState<null | 'webcam' | 'screen' | 'video' | 'pdf'>(null)

  const showRight = true
  const { openCanvas } = useCanvas()
  return (
    <StudioLayout tab={tab} onChangeTab={setTab} left={<LeftSidebar />} right={showRight ? <RightSections /> : undefined} showLeft showRight={showRight}>
      {tab === 'chat' && (
        <div className="h-[75dvh] rounded-xl border bg-card/50 overflow-hidden">
          <AIEChat />
        </div>
      )}
      {tab === 'build' && (
        <div className="h-[75dvh] rounded-xl border bg-card/50 p-4">
          <div className="text-sm text-muted-foreground mb-3">Open a tool in the same frame:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTool('webcam')}>
              <Camera className="h-5 w-5" /> Webcam
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTool('screen')}>
              <Monitor className="h-5 w-5" /> Screen
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTool('video')}>
              <Video className="h-5 w-5" /> Video→App
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTool('pdf')}>
              <FileText className="h-5 w-5" /> PDF
            </Button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">Tip: the right panel shows the 1/7 stages.</div>

          {/* In-frame tool canvas */}
          <div className="mt-4 h-[58dvh] rounded-xl border bg-background/60 overflow-hidden">
            {!activeTool && (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">
                Pick a tool above to open it here.
              </div>
            )}
            {activeTool === 'webcam' && (
              <WebcamCapture mode="canvas" onClose={() => setActiveTool(null)} onCancel={() => setActiveTool(null)} onCapture={() => {}} onAIAnalysis={() => {}} />
            )}
            {activeTool === 'screen' && (
              <ScreenShare mode="canvas" onClose={() => setActiveTool(null)} onCancel={() => setActiveTool(null)} onAnalysis={() => {}} />
            )}
            {activeTool === 'video' && (
              <div className="h-full w-full grid place-items-center p-6 text-center text-sm text-muted-foreground">
                <div>
                  <p className="mb-3">Use the main Chat to run Video → App (opens the canvas automatically when you paste a YouTube URL).</p>
                  <Button onClick={() => openCanvas('video')}>Open in Chat Canvas</Button>
                </div>
              </div>
            )}
            {activeTool === 'pdf' && (
              <div className="h-full w-full overflow-auto p-4">
                <EnhancedFileUpload />
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'learn' && (
        <div className="h-[75dvh] rounded-xl border bg-card/50 overflow-hidden">
          <WorkshopPanel />
        </div>
      )}
    </StudioLayout>
  )
}


