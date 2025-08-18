"use client"

import React, { useState } from "react"
import { Camera, Monitor, Calculator, Video, MessageCircle } from "lucide-react"
import { LeftToolRail } from "@/components/collab/LeftToolRail"
import { RightStageRail } from "@/components/collab/RightStageRail"
import { BottomDock } from "@/components/collab/BottomDock"
import { TopHeader } from "@/components/collab/TopHeader"
import { CenterCanvas } from "@/components/collab/CenterCanvas"
import { CollabShell } from "@/components/collab/CollabShell"
import { MobileStageProgress } from "@/components/collab/MobileStageProgress"
import { QuickActionsRow } from "@/components/collab/QuickActionsRow"
import { ChatPane } from "@/components/collab/ChatPane"
import { WebPreviewPanel } from "@/components/collab/WebPreviewPanel"
import { SuggestionsRow } from "@/components/collab/SuggestionsRow"
import { WebcamPanel } from "@/components/collab/WebcamPanel"
import { ScreenSharePanel } from "@/components/collab/ScreenSharePanel"
import { PanelSkeleton } from "@/components/collab/PanelSkeleton"
import { HelpHint } from "@/components/collab/HelpHint"

type PanelState = "empty" | "webcam" | "screen" | "video" | "roi" | "webpreview"

export default function TestChatDesignPage() {
  const [state, setState] = useState<PanelState>("empty")
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(() => (typeof window !== 'undefined' ? window.localStorage.getItem('intelligence-session-id') : null))
  const [intent, setIntent] = useState<string | null>(null)

  function switchState(next: PanelState) {
    if (next === 'empty') return setState(next)
    setLoading(true)
    setTimeout(() => { setState(next); setLoading(false) }, 200)
  }

  return (
    <>
      <MobileStageProgress
        stages={[
          { id: 'greet', label: 'Greeting', done: true },
          { id: 'research', label: 'Background Research', current: true },
          { id: 'proposal', label: 'Proposal' },
          { id: 'finish', label: 'Finish & Email' },
        ]}
      />
      <CollabShell
      header={<TopHeader title="F.B/c — Test Chat (Design Only)" subtitle="Brand tokens · glass surfaces · AA contrast" rightActions={<button className="btn-minimal hover:bg-[var(--color-orange-accent)]/10 hover:border-[var(--color-orange-accent)]/30">Feedback</button>} statusChip={intent ? (<span className="text-[10px] rounded-md border px-2 py-0.5 text-muted-foreground">intent: {intent}</span>) : null} />}
      left={
        <LeftToolRail
          items={[
            { id: 'webcam', icon: <Camera className="h-4 w-4" />, label: 'Webcam', active: state === 'webcam', onClick: () => switchState('webcam') },
            { id: 'screen', icon: <Monitor className="h-4 w-4" />, label: 'Screen', active: state === 'screen', onClick: () => switchState('screen') },
            { id: 'roi', icon: <Calculator className="h-4 w-4" />, label: 'ROI', active: state === 'roi', onClick: () => switchState('roi') },
            { id: 'video', icon: <Video className="h-4 w-4" />, label: 'Video→App', active: state === 'video', onClick: () => switchState('video') },
          ]}
        />
      }
      center={
        <CenterCanvas
          state={state}
          empty={
            <div className="max-w-sm" role="region" aria-label="Empty state quick actions">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <h2 className="text-lg font-semibold">What do you want to do?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use a quick action or type your request. Tools live on the left rail; results appear here.</p>
              <QuickActionsRow
                actions={[
                  { id: 'search', label: 'Search', onClick: () => switchState('webpreview') },
                  { id: 'webcam', label: 'Webcam', onClick: () => switchState('webcam') },
                  { id: 'screen', label: 'Screen', onClick: () => switchState('screen') },
                  { id: 'roi', label: 'ROI', onClick: () => switchState('roi') },
                  { id: 'video', label: 'Video→App', onClick: () => switchState('video') },
                ]}
                className="mt-4"
              />
            </div>
          }
        >
          {state === 'empty' ? (
            <div className="rounded-xl border border-border/50 bg-background/60 p-6 text-sm text-muted-foreground">
              Mock content panel: <span className="font-medium text-foreground">{state}</span>
            </div>
          ) : loading ? (
            <PanelSkeleton />
          ) : state === 'webpreview' ? (
            <WebPreviewPanel url="https://example.com" onBack={() => switchState('empty')} />
          ) : state === 'webcam' ? (
            <WebcamPanel onBack={() => switchState('empty')} />
          ) : state === 'screen' ? (
            <ScreenSharePanel onBack={() => switchState('empty')} />
          ) : (
            <ChatPane sessionId={sessionId} onAfterSend={async (text) => {
              try {
                const res = await fetch('/api/intelligence/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, userMessage: text }) })
                if (res.ok) { const j = await res.json(); setIntent(j?.output?.type || j?.type || null) }
              } catch {}
            }} />
          )}
        </CenterCanvas>
      }
      right={
        <RightStageRail
          stages={[
            { id: 'greet', label: 'Greeting', done: true, onClick: () => {} },
            { id: 'research', label: 'Background Research', current: true, onClick: () => {} },
            { id: 'proposal', label: 'Proposal', onClick: () => {} },
            { id: 'finish', label: 'Finish & Email', onClick: () => {} },
          ]}
        />
      }
      dock={
        <div className="border-t bg-background/70 backdrop-blur">
          <div className="p-2">
            <SuggestionsRow
              suggestions={[
                { id: 'suggest-1', label: 'Analyze website', onClick: () => switchState('webpreview') },
                { id: 'suggest-2', label: 'Calculate ROI', onClick: () => switchState('roi') },
                { id: 'suggest-3', label: 'Translate to Spanish', onClick: () => {} },
              ]}
              className="mb-1"
            />
            <HelpHint className="mb-1" />
            <BottomDock
              value={input}
              onChange={setInput}
              onSend={() => {}}
              disabled={false}
              quick={[
                { id: 'webcam', label: 'Webcam', onClick: () => switchState('webcam') },
                { id: 'screen', label: 'Screen', onClick: () => switchState('screen') },
                { id: 'roi', label: 'ROI', onClick: () => switchState('roi') },
                { id: 'video', label: 'Video→App', onClick: () => switchState('video') },
              ]}
            />
          </div>
        </div>
      }
    />
    </>
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


