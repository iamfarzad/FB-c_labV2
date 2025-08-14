'use client'

import React, { useMemo } from 'react'
import { CanvasWorkspace } from '@/components/chat/CanvasWorkspace'
import { WebcamCapture } from '@/components/chat/tools/WebcamCapture/WebcamCapture'
import { ScreenShare } from '@/components/chat/tools/ScreenShare/ScreenShare'
import { VideoToApp } from '@/components/chat/tools/VideoToApp/VideoToApp'
import { CodeBlock } from '@/components/ai-elements/code-block'
import { useCanvas } from '@/components/providers/canvas-provider'

const TITLES: Record<string, string> = {
  webcam: 'Webcam',
  screen: 'Screen Share',
  video: 'Video to App',
  pdf: 'Document',
  code: 'Code',
  webpreview: 'Preview',
}

export function CanvasOrchestrator() {
  const { canvas, closeCanvas } = useCanvas()
  const { type, props } = canvas

  const content = useMemo(() => {
    switch (type) {
      case 'webcam':
        return (
          <div className="h-full p-3">
            <WebcamCapture mode="canvas" onClose={closeCanvas} onAIAnalysis={() => {}} />
          </div>
        )
      case 'screen':
        return (
          <div className="h-full p-3">
            <ScreenShare mode="canvas" onClose={closeCanvas} />
          </div>
        )
      case 'video':
        return (
          <div className="h-full p-3">
            <VideoToApp
              mode="canvas"
              videoUrl={(props?.videoUrl as string) || ''}
              onClose={closeCanvas}
              onAppGenerated={props?.onAppGenerated as any}
            />
          </div>
        )
      case 'pdf':
        return (
          <div className="h-full p-3">
            <iframe className="h-full w-full rounded border" src={(props?.url as string) || ''} />
          </div>
        )
      case 'code':
        return (
          <div className="h-full p-3 overflow-auto">
            <CodeBlock code={(props?.code as string) || ''} language={(props?.lang as string) || 'tsx'} />
          </div>
        )
      case 'webpreview':
        return props?.children as React.ReactNode
      default:
        return null
    }
  }, [type, props, closeCanvas])

  if (!type) return null

  return (
    <CanvasWorkspace
      open={!!type}
      title={TITLES[type] ?? 'Canvas'}
      onClose={closeCanvas}
      left={props?.left as React.ReactNode}
      consoleArea={props?.console as React.ReactNode}
    >
      {content}
    </CanvasWorkspace>
  )
}


