"use client"

import type React from "react"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

interface WebcamHeaderProps {
  captureCount: number
  onClose: () => void
}

export const WebcamHeader: React.FC<WebcamHeaderProps> = ({ captureCount, onClose }) => {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Image Capture</CardTitle>
              <p className="text-sm text-white/70">Photos automatically go to chat</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20">
              {captureCount} photos
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
