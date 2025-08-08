'use client'

import { useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export type CanvasWorkspaceProps = {
  open: boolean
  title?: string
  onClose: () => void
  left?: React.ReactNode
  consoleArea?: React.ReactNode
  children: React.ReactNode
}

export function CanvasWorkspace({ open, title = 'Canvas', onClose, left, consoleArea, children }: CanvasWorkspaceProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] bg-background/95">
      {/* Toolbar */}
      <div className="flex h-12 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Open in new window" title="Open in new window">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Close canvas" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Body with resizable panels */}
      <div className="h-[calc(100%-3rem)] w-full overflow-hidden p-3">
        <PanelGroup direction="vertical" className="h-full w-full rounded-lg border bg-card">
          <Panel defaultSize={80} minSize={60}>
            <PanelGroup direction="horizontal" className="h-full w-full">
              {left ? (
                <Panel defaultSize={22} minSize={16} maxSize={34}>
                  <div className="h-full w-full overflow-auto border-r p-3 text-sm">
                    {left}
                  </div>
                </Panel>
              ) : null}
              {left ? <PanelResizeHandle className="w-1 bg-border/60 hover:bg-border" /> : null}
              <Panel minSize={50}>
                <div className="h-full w-full overflow-hidden p-1 md:p-3">
                  <div className="h-full w-full rounded-md border bg-background min-h-[60vh] md:min-h-0">
                    {children}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          {consoleArea ? <PanelResizeHandle className="h-1 bg-border/60 hover:bg-border" /> : null}
          {consoleArea ? (
            <Panel defaultSize={20} minSize={12}>
              <div className="h-full w-full overflow-auto border-t p-2 md:p-3 text-xs">
                {consoleArea}
              </div>
            </Panel>
          ) : null}
        </PanelGroup>
      </div>
    </div>
  )
}


