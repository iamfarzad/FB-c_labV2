"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, Mic, Wifi, WifiOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useToast } from "@/components/ui/use-toast"
import { useDemoSession } from "@/components/demo-session-manager"
import { WebRTCAudioProcessor } from "@/lib/webrtc-audio-processor"

interface VoiceInputModalProps {
  isOpen: boolean
  onClose: () => void
  onTransferToChat: (fullTranscript: string) => void
  leadContext?: {
    name?: string
    company?: string
    role?: string
    interests?: string
  }
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({ isOpen, onClose, onTransferToChat }) => {
  const { addActivity } = useChatContext()
  const { sessionId: demoSessionId } = useDemoSession()
  const { toast } = useToast()

  const sessionId = demoSessionId || `session-${Date.now()}`

  const [status, setStatus] = useState<ConnectionStatus>("disconnected")
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")

  const wsRef = useRef<WebSocket | null>(null)
  const audioProcessorRef = useRef<WebRTCAudioProcessor | null>(null)

  const cleanup = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    audioProcessorRef.current?.cleanup()
    audioProcessorRef.current = null
    setStatus("disconnected")
    setIsRecording(false)
    setTranscript("")
  }, [])

  const handleClose = useCallback(() => {
    cleanup()
    onClose()
  }, [cleanup, onClose])

  const connect = useCallback(async () => {
    if (wsRef.current || !WebRTCAudioProcessor.isSupported()) {
      if (!WebRTCAudioProcessor.isSupported()) {
        toast({
          title: "WebRTC Not Supported",
          description: "Your browser does not support WebRTC.",
          variant: "destructive",
        })
        setStatus("error")
      }
      return
    }

    setStatus("connecting")
    addActivity({ type: "webrtc", title: "Connecting...", status: "in_progress" })

    const socket = new WebSocket(process.env.NEXT_PUBLIC_WEBRTC_SIGNALING_URL || "ws://localhost:3002")
    wsRef.current = socket

    const processor = new WebRTCAudioProcessor(WebRTCAudioProcessor.getOptimalConfig("conversation"))
    await processor.initialize()
    audioProcessorRef.current = processor
    const peerConnection = processor.getPeerConnection()

    socket.onopen = () => {
      console.log("✅ Signaling server connected")
      socket.send(JSON.stringify({ type: "join-session", payload: { sessionId } }))
    }

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data)
      console.log("Received message from signaling server:", data.type)

      switch (data.type) {
        case "session-joined":
          setStatus("connected")
          addActivity({
            type: "webrtc",
            title: "Connected",
            description: "WebRTC connection established.",
            status: "completed",
          })
          await createAndSendOffer()
          break

        case "answer":
          await processor.setRemoteDescription(data.payload)
          console.log("✅ Answer received and remote description set")
          break

        case "ice-candidate":
          await processor.addIceCandidate(data.payload)
          break

        case "transcription":
          setTranscript((prev) => prev + data.payload.text)
          break
      }
    }

    socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error)
      setStatus("error")
      toast({
        title: "Connection Error",
        description: "Could not connect to the signaling server.",
        variant: "destructive",
      })
      addActivity({ type: "webrtc", title: "Connection Failed", status: "failed" })
    }

    socket.onclose = () => {
      console.log("🔌 Signaling server disconnected")
      setStatus("disconnected")
    }

    if (peerConnection) {
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket.readyState === WebSocket.OPEN) {
          console.log("Sending ICE candidate to server")
          socket.send(JSON.stringify({ type: "ice-candidate", payload: event.candidate.toJSON() }))
        }
      }
    }
  }, [sessionId, toast, addActivity])

  useEffect(() => {
    if (isOpen) {
      connect()
    } else {
      cleanup()
    }
    return () => cleanup()
  }, [isOpen, cleanup, connect])

  const createAndSendOffer = async () => {
    if (!audioProcessorRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    try {
      await audioProcessorRef.current.startAudioCapture()
      const offer = await audioProcessorRef.current.createOffer()
      wsRef.current.send(JSON.stringify({ type: "offer", payload: offer }))
      console.log("✅ Offer sent to signaling server")
      setIsRecording(true) // Start "recording" once offer is sent
    } catch (error) {
      console.error("❌ Failed to create and send offer:", error)
      setStatus("error")
      toast({ title: "WebRTC Error", description: "Failed to create connection offer.", variant: "destructive" })
    }
  }

  const handleOrbClick = () => {
    if (status !== "connected") return
    setIsRecording((prev) => !prev)
  }

  const handleSendToChat = () => {
    if (transcript.trim()) {
      onTransferToChat(transcript)
      setTranscript("")
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full h-full flex flex-col items-center justify-center p-6 relative max-w-4xl mx-auto"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-6 right-6 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex flex-col items-center space-y-8 w-full">
            <motion.div
              className={cn(
                "relative w-40 h-40 rounded-full bg-gradient-to-br shadow-2xl backdrop-blur-sm border border-white/20 cursor-pointer",
                isRecording ? "from-red-400 via-red-500 to-red-600" : "from-slate-400 via-slate-500 to-slate-600",
                status !== "connected" && "opacity-50 cursor-not-allowed",
              )}
              animate={{ scale: isRecording ? [1, 1.05, 1] : 1 }}
              transition={{
                scale: { duration: 1, repeat: isRecording ? Number.POSITIVE_INFINITY : 0, ease: "easeInOut" },
              }}
              whileHover={{ scale: status === "connected" ? 1.05 : 1 }}
              whileTap={{ scale: status === "connected" ? 0.95 : 1 }}
              onClick={handleOrbClick}
            >
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-white">Live Voice Input (WebRTC)</h2>
              <div className="flex items-center justify-center gap-4 text-white/70">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-white/20",
                    status === "connected" && "bg-green-500/20 text-green-200 border-green-500/30",
                    status === "connecting" && "bg-blue-500/20 text-blue-200 border-blue-500/30",
                    status === "error" && "bg-red-600/20 text-red-200 border-red-600/30",
                    status === "disconnected" && "bg-white/10 text-white",
                  )}
                >
                  {status === "connected" ? <Wifi className="w-4 h-4 mr-2" /> : <WifiOff className="w-4 h-4 mr-2" />}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </div>
              <p className="text-white/80 text-lg">
                {status === "connected"
                  ? isRecording
                    ? "Live... tap to mute"
                    : "Muted. Tap to speak."
                  : "Establishing secure connection..."}
              </p>
            </div>

            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Live Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[120px] max-h-[300px] overflow-y-auto space-y-2 text-white/90 leading-relaxed">
                  {transcript || <span className="text-white/50">Your speech will appear here in real-time...</span>}
                  {isRecording && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              {transcript && (
                <Button onClick={handleSendToChat} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Chat
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceInputModal
