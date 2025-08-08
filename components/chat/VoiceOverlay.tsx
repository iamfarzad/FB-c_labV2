"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, X } from "@/lib/icon-mapping"
import { FbcIcon } from "@/components/ui/fbc-icon"
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
    volume,
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

  React.useEffect(() => {
    function onTurnCompleteGlobal(e: Event) {
      const ce = e as CustomEvent<any>
      const final = ce.detail?.transcript || ''
      if (final) {
        onAccept(final)
      }
    }
    window.addEventListener('voice-turn-complete', onTurnCompleteGlobal as EventListener)
    return () => window.removeEventListener('voice-turn-complete', onTurnCompleteGlobal as EventListener)
  }, [onAccept])

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
          <div className="h-full w-full flex flex-col items-center justify-center gap-10 px-6">
            {/* Orb */}
            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-full opacity-20" style={{background:'radial-gradient(60% 60% at 50% 50%, hsl(var(--accent)), transparent 70%)'}} />
              <button onClick={handleToggle} className="relative size-44 md:size-56 rounded-full outline-none select-none">
                <div className="absolute inset-0 rounded-full bg-[hsl(var(--card))] shadow-[0_0_0_1px_hsl(var(--border))_inset]" />
                <div className="absolute inset-2 rounded-full" style={{background:'radial-gradient(70% 70% at 50% 40%, hsl(var(--accent)), transparent 70%)', opacity:0.18}} />
                {!isRecording && (<div className="absolute -inset-[6px] rounded-full border border-[hsl(var(--border))]" />)}
                {isRecording && (<>
                  <div className="absolute -inset-[10px] rounded-full border border-[hsl(var(--accent))] opacity-60 animate-pulse" />
                  <div className="absolute -inset-[22px] rounded-full border border-[hsl(var(--accent))] opacity-20 animate-ping" />
                  <div className="absolute inset-0 rounded-full" style={{maskImage:'radial-gradient(circle at 50% 50%, transparent 45%, black 46%)'}}>
                    <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite] border border-[hsl(var(--accent))] opacity-30" />
                  </div>
                </>)}
                <div className="absolute inset-0 grid place-items-center">
                  <FbcIcon className="size-8 opacity-90" />
                </div>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button data-test="toggle-voice" size="icon" className="w-12 h-12 rounded-full" onClick={handleToggle} aria-label="Toggle recording">
                <Mic className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={onCancel} aria-label="Cancel">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="w-full max-w-xl">
              {/* Live level meter */}
              <div className="mb-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${Math.min(100, Math.max(0, Math.round(volume * 100)))}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
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


