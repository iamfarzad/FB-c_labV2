"use client"

import type React from "react"
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from "@/components/ai-elements/web-preview"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

export function WebPreviewPanel({ url = "https://example.com", onBack }: { url?: string, onBack?: () => void }) {
  const logs = [{ level: 'log' as const, message: 'Console initialized', timestamp: new Date() }]
  return (
    <div className="h-full w-full p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Web Preview</h3>
        {onBack && (
          <button className="btn-minimal" onClick={onBack}>Back to Chat</button>
        )}
      </div>
      <WebPreview defaultUrl={url}>
        <WebPreviewNavigation>
          <WebPreviewNavigationButton tooltip="Back" aria-label="Back">
            <ArrowLeftIcon className="h-4 w-4" />
          </WebPreviewNavigationButton>
          <WebPreviewNavigationButton tooltip="Forward" aria-label="Forward">
            <ArrowRightIcon className="h-4 w-4" />
          </WebPreviewNavigationButton>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody className="h-56" />
        <WebPreviewConsole logs={logs} />
      </WebPreview>
    </div>
  )
}


