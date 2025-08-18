"use client"

import type React from "react"
import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input"

export interface QuickAction {
  id: string
  label: string
  onClick: () => void
}

interface BottomDockProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled?: boolean
  quick?: QuickAction[]
  className?: string
  rightArea?: React.ReactNode
}

export function BottomDock({ value, onChange, onSend, disabled, quick = [], className, rightArea }: BottomDockProps) {
  return (
    <div className={className}>
      <PromptInput onSubmit={e => { e.preventDefault(); if (!disabled) onSend() }}>
        <PromptInputToolbar>
          <PromptInputTools>
            {quick.slice(0, 4).map(q => (
              <PromptInputButton key={q.id} variant="ghost" onClick={q.onClick}>{q.label}</PromptInputButton>
            ))}
          </PromptInputTools>
          {rightArea ? <div className="ml-auto">{rightArea}</div> : null}
        </PromptInputToolbar>
        <PromptInputTextarea
          placeholder="Type and press Enter to send"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!disabled) onSend() } }}
          disabled={disabled}
        />
        <div className="flex items-center justify-end p-1">
          <PromptInputSubmit status={disabled ? 'submitted' : undefined}>Send</PromptInputSubmit>
        </div>
      </PromptInput>
    </div>
  )
}


