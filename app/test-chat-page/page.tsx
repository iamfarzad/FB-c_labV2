"use client"

import React, { useState } from "react"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { cn } from "@/lib/utils"
import { Camera, Monitor, Calculator, Video, MessageCircle } from "lucide-react"
import { LeftToolRail } from "@/components/collab/LeftToolRail"
import { RightStageRail } from "@/components/collab/RightStageRail"
import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input"

type PanelState = "empty" | "webcam" | "screen" | "video" | "roi"

export default function TestChatDesignPage() {
  const [state, setState] = useState<PanelState>("empty")
  const [input, setInput] = useState("")

  return (
    <div className="h-dvh grid grid-rows-[auto_1fr_auto] md:grid-rows-[auto_1fr] md:grid-cols-[56px_1fr_320px] bg-background text-foreground">
      {/* Header */}
      <div className="col-span-full md:col-start-2 md:col-end-4 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <FbcIcon className="h-5 w-5" />
            <div>
              <h1 className="text-sm font-semibold leading-tight tracking-tight">F.B/c — Test Chat (Design Only)</h1>
              <p className="text-xs text-muted-foreground">Brand tokens · glass surfaces · AA contrast</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="btn-minimal">Feedback</button>
          </div>
        </div>
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
        <div className="h-full p-4 md:p-6">
          <div className="h-full rounded-xl border bg-card">
            {state === "empty" ? (
              <div className="grid h-full place-items-center p-6 text-center">
                <div className="max-w-sm" role="region" aria-label="Empty state quick actions">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Start in the dock below</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Use a quick action or type a message.</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Chip onClick={() => setState("webcam")}>Webcam</Chip>
                    <Chip onClick={() => setState("screen")}>Screen</Chip>
                    <Chip onClick={() => setState("roi")}>ROI</Chip>
                    <Chip onClick={() => setState("video")}>Video→App</Chip>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full grid place-items-center p-6">
                <div className="rounded-xl border border-border/50 bg-background/60 p-6 text-sm text-muted-foreground">
                  Mock content panel: <span className="font-medium text-foreground">{state}</span>
                </div>
              </div>
            )}
          </div>
        </div>
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
          <PromptInput onSubmit={e => { e.preventDefault() }}>
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputButton variant="ghost" onClick={() => setState("webcam")}>Webcam</PromptInputButton>
                <PromptInputButton variant="ghost" onClick={() => setState("screen")}>Screen</PromptInputButton>
                <PromptInputButton variant="ghost" onClick={() => setState("roi")}>ROI</PromptInputButton>
                <PromptInputButton variant="ghost" onClick={() => setState("video")}>Video→App</PromptInputButton>
              </PromptInputTools>
            </PromptInputToolbar>
            <PromptInputTextarea
              placeholder="Message F.B/c… (design-only sandbox)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                }
              }}
            />
            <div className="flex items-center justify-end p-1">
              <PromptInputSubmit status="submitted">Send</PromptInputSubmit>
            </div>
          </PromptInput>
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


