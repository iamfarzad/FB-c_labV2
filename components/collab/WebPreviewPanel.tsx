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

export function WebPreviewPanel({ url = "https://example.com" }: { url?: string }) {
  const logs = [{ level: 'log' as const, message: 'Console initialized', timestamp: new Date() }]
  return (
    <div className="h-full w-full p-3">
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


