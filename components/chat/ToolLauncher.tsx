'use client'

import React from 'react'
import { Plus, Camera, Monitor, Video, FileText } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/primitives/button'
import { useCanvas } from '@/components/providers/canvas-provider'

export function ToolLauncher() {
  const { openCanvas } = useCanvas()
  const contentId = React.useId().replace(/[:]/g, '-')
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-28 right-4 h-14 w-14 rounded-full shadow-lg" aria-haspopup="dialog" aria-controls={contentId}>
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent id={contentId} side="bottom" className="h-[52vh] rounded-t-2xl" aria-label="Tool launcher">
        <div className="grid grid-cols-4 gap-3">
          <Button variant="outline" className="h-24 flex-col" onClick={() => openCanvas('webcam')}>
            <Camera className="h-6 w-6" /> Webcam
          </Button>
          <Button variant="outline" className="h-24 flex-col" onClick={() => openCanvas('screen')}>
            <Monitor className="h-6 w-6" /> Screen
          </Button>
          <Button variant="outline" className="h-24 flex-col" onClick={() => openCanvas('video')}>
            <Video className="h-6 w-6" /> Video→App
          </Button>
          <Button variant="outline" className="h-24 flex-col" onClick={() => openCanvas('pdf')}>
            <FileText className="h-6 w-6" /> PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}


