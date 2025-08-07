"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, X } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import { useWebSocketVoice } from "@/hooks/use-websocket-voice"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"

export interface VoiceOverlayProps {
  open: boolean
  onCancel: () => void
  onAccept: (transcript: string) => void
}

export function VoiceOverlay({ open, onCancel, onAccept }: VoiceOverlayProps) {
  const {
    isConnected,
    isProcessing,
    transcript,
    startSession,
    stopSession,
    onAudioChunk,
    onTurnComplete,
  } = useWebSocketVoice()

  const {
    isRecording,
    startRecording,
    stopRecording,
    requestPermission,
    hasPermission,
  } = useVoiceRecorder({ onAudioChunk, onTurnComplete })

  React.useEffect(() => {
    if (!open) return
    ;(async () => {
      if (!hasPermission) await requestPermission()
      try { await startSession() } catch {}
    })()
    return () => {
      stopRecording()
      stopSession()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleToggle = async () => {
    if (isRecording) {
      stopRecording()
      onTurnComplete()
    } else {
      if (!isConnected) { try { await startSession() } catch {} }
      await startRecording()
    }
  }

  const handleAccept = () => onAccept(transcript || "")

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] bg-background/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="h-full w-full flex flex-col items-center justify-center gap-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="w-40 h-40 rounded-full bg-[hsl(var(--accent))/0.08] flex items-center justify-center"
            >
              <div className={cn("w-28 h-28 rounded-full", isRecording ? "bg-[hsl(var(--accent))/0.25]" : "bg-card")}></div>
            </motion.div>

            <div className="flex items-center gap-4">
              <Button
                size="icon"
                className="w-14 h-14 rounded-full"
                onClick={handleToggle}
                aria-label="Toggle recording"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full"
                onClick={onCancel}
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="w-full max-w-xl px-6">
              <div className="h-24 rounded-xl border bg-card/70 p-3 text-sm overflow-auto">
                {transcript || (isProcessing ? "Processing…" : "Say something and then Accept")}
              </div>
              <div className="mt-4 flex justify-center">
                <Button onClick={handleAccept} disabled={!transcript}>Use transcript</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceOverlay


