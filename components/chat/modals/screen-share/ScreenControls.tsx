"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Brain, Loader2, Square, Monitor, Download, SwitchCameraIcon as Switch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ScreenControlsProps {
  stream: MediaStream | null
  isAnalyzing: boolean
  isAutoAnalyzing: boolean
  analysisHistoryCount: number
  onAnalyze: () => void
  onStop: () => void
  onDownload: () => void
  onToggleAutoAnalysis: (enabled: boolean) => void
}

export const ScreenControls: React.FC<ScreenControlsProps> = ({
  stream,
  isAnalyzing,
  isAutoAnalyzing,
  analysisHistoryCount,
  onAnalyze,
  onStop,
  onDownload,
  onToggleAutoAnalysis,
}) => {
  return (
    <>
      {/* Overlay Controls */}
      {stream && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <Card className="bg-black/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      className="w-2 h-2 rounded-full bg-red-500"
                    />
                    <span className="text-sm font-medium text-white">LIVE</span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-white/20" />
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-white/70" />
                    <span className="text-sm text-white/70">{isAutoAnalyzing ? "Auto-analyzing" : "Manual mode"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="bg-black/60 hover:bg-black/80 text-white border-white/20"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              </Button>
              <Button variant="destructive" size="sm" onClick={onStop} className="bg-red-600/80 hover:bg-red-600">
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={isAutoAnalyzing} onCheckedChange={onToggleAutoAnalysis} disabled={!stream} />
            <span className="text-sm text-white/80">Auto-analyze (10s interval)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={isAnalyzing || !stream}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
            Analyze Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={analysisHistoryCount === 0}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </>
  )
}
