"use client"

import type React from "react"
import { MonitorSpeaker, Eye, EyeOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ScreenShareState = "initializing" | "sharing" | "analyzing" | "error" | "stopped"

interface ScreenShareHeaderProps {
  screenState: ScreenShareState
  isAutoAnalyzing: boolean
  analysisCount: number
  showAnalysisPanel: boolean
  onToggleAnalysisPanel: () => void
  onClose: () => void
}

export const ScreenShareHeader: React.FC<ScreenShareHeaderProps> = ({
  screenState,
  isAutoAnalyzing,
  analysisCount,
  showAnalysisPanel,
  onToggleAnalysisPanel,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <MonitorSpeaker className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Screen Analysis</h2>
            <p className="text-sm text-white/70">AI-powered real-time screen content analysis</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-white/20",
              screenState === "sharing" && "bg-green-500/20 text-green-200 border-green-500/30",
              screenState === "analyzing" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
              screenState === "initializing" && "bg-amber-500/20 text-amber-200 border-amber-500/30",
              screenState === "error" && "bg-red-500/20 text-red-200 border-red-500/30",
              screenState === "stopped" && "bg-slate-500/20 text-slate-200 border-slate-500/30",
            )}
          >
            {screenState.charAt(0).toUpperCase() + screenState.slice(1)}
          </Badge>

          {isAutoAnalyzing && (
            <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
              Auto Mode
            </Badge>
          )}

          <Badge variant="outline" className="bg-white/10 text-white border-white/20">
            {analysisCount} analyses
          </Badge>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAnalysisPanel}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          {showAnalysisPanel ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
