"use client"

import React, { useState } from "react"
import { StudioLayout } from "@/components/studio/StudioLayout"
import { AIEChat } from "@/components/chat/AIEChat"
import WorkshopPanel from "@/components/workshop/WorkshopPanel"

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
      <div className="mb-2 font-medium">Sections</div>
      <ul className="space-y-1">
        {['Overview','Modules','Outline','Lab','Achievements','Stats'].map((s) => (
          <li key={s} className="rounded-md px-2 py-1 hover:bg-muted/60 cursor-default truncate">{s}</li>
        ))}
      </ul>
    </div>
  )
}

export default function StudioWireframePage() {
  const [tab, setTab] = useState<'chat' | 'build' | 'learn'>('chat')

  const showRight = tab === 'learn'
  return (
    <StudioLayout tab={tab} onChangeTab={setTab} left={<LeftSidebar />} right={showRight ? <RightSections /> : undefined} showLeft showRight={showRight}>
      {tab === 'chat' && (
        <div className="h-[75dvh] rounded-xl border bg-card/50">
          <AIEChat />
        </div>
      )}
      {tab === 'build' && (
        <div className="h-[75dvh] rounded-xl border bg-card/50 grid place-items-center text-sm text-muted-foreground">
          <div>Use the launcher (bottom-right on mobile) to open Webcam / Screen / Video → App / PDF.</div>
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


