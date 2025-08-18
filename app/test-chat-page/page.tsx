"use client"

import React, { useState } from "react"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { cn } from "@/lib/utils"
import { Camera, Monitor, Calculator, Video, MessageCircle } from "lucide-react"
import { LeftToolRail } from "@/components/collab/LeftToolRail"
import { RightStageRail } from "@/components/collab/RightStageRail"
import { BottomDock } from "@/components/collab/BottomDock"
import { TopHeader } from "@/components/collab/TopHeader"
import { CenterCanvas } from "@/components/collab/CenterCanvas"

type PanelState = "empty" | "webcam" | "screen" | "video" | "roi"

export default function TestChatDesignPage() {
  const [state, setState] = useState<PanelState>("empty")
  const [input, setInput] = useState("")

  return (
    <div className="h-dvh grid grid-rows-[auto_1fr_auto] md:grid-rows-[auto_1fr] md:grid-cols-[56px_1fr_320px] bg-background text-foreground">
      {/* Header */}
      <div className="col-span-full md:col-start-2 md:col-end-4">
        <TopHeader
          title="F.B/c — Test Chat (Design Only)"
          subtitle="Brand tokens · glass surfaces · AA contrast"
          rightActions={<button className="btn-minimal">Feedback</button>}
        />
      </div>

      {/* Left rail */}
      <aside className="hidden md:block border-r bg-card/40">
        <LeftToolRail
          items={[
            { id: 'webcam', icon: <Camera className="h-4 w-4" />, label: 'Webcam', active: state === 'webcam', onClick: () => setState('webcam') },
            { id: 'screen', icon: <Monitor className="h-4 w-4" />, label: 'Screen', active: state === 'screen', onClick: () => setState('screen') },
            { id: 'roi', icon: <Calculator className="h-4 w-4" />, label: 'ROI', active: state === 'roi', onClick: () => setState('roi') },
            { id: 'video', icon: <Video className="h-4 w-4" />, label: 'Video→App', active: state === 'video', onClick: () => setState('video') },
          ]}
        />
      </aside>

      {/* Center canvas */}
      <main className="min-h-0 overflow-hidden">
        <CenterCanvas
          state={state}
          empty={
            <div className="max-w-sm" role="region" aria-label="Empty state quick actions">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Start in the dock below</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use a quick action or type a message.</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Chip onClick={() => setState('webcam')}>Webcam</Chip>
                <Chip onClick={() => setState('screen')}>Screen</Chip>
                <Chip onClick={() => setState('roi')}>ROI</Chip>
                <Chip onClick={() => setState('video')}>Video→App</Chip>
              </div>
            </div>
          }
        >
          <div className="rounded-xl border border-border/50 bg-background/60 p-6 text-sm text-muted-foreground">
            Mock content panel: <span className="font-medium text-foreground">{state}</span>
          </div>
        </CenterCanvas>
      </main>

      {/* Right stage rail */}
      <aside className="hidden md:block border-l bg-card/30">
        <RightStageRail
          stages={[
            { id: 'greet', label: 'Greeting', done: true, onClick: () => {} },
            { id: 'research', label: 'Background Research', current: true, onClick: () => {} },
            { id: 'proposal', label: 'Proposal', onClick: () => {} },
            { id: 'finish', label: 'Finish & Email', onClick: () => {} },
          ]}
        />
      </aside>

      {/* Bottom dock (mobile + desktop) */}
      <div className="col-span-full md:col-start-2 md:col-end-4 border-t bg-background/70 backdrop-blur">
        <div className="p-2">
          <BottomDock
            value={input}
            onChange={setInput}
            onSend={() => {}}
            disabled={false}
            quick={[
              { id: 'webcam', label: 'Webcam', onClick: () => setState('webcam') },
              { id: 'screen', label: 'Screen', onClick: () => setState('screen') },
              { id: 'roi', label: 'ROI', onClick: () => setState('roi') },
              { id: 'video', label: 'Video→App', onClick: () => setState('video') },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// RailButton removed; replaced by LeftToolRail

function Chip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full border border-border/40 bg-card/60 text-sm text-foreground hover:bg-[var(--color-orange-accent)]/10 hover:border-[var(--color-orange-accent)]/30 hover:text-[var(--color-orange-accent)] transition-colors"
    >
      {children}
    </button>
  )
}

// StageItem removed; replaced by RightStageRail


