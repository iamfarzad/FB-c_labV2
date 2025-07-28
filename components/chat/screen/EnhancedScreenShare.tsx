"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Monitor, StopCircle, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

export function EnhancedScreenShare() {
  const { addActivity } = useChatContext()
  const [isSharing, setIsSharing] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      setMediaStream(stream)
      setIsSharing(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" })
        setRecordedBlob(blob)
      }
      recorder.start()

      stream.getVideoTracks()[0].onended = () => stopSharing()
      addActivity({ type: "screen-share", status: "in-progress", content: "Screen sharing started" })
    } catch (err) {
      console.error("Error starting screen share:", err)
      addActivity({ type: "error", status: "error", content: "Failed to start screen share" })
    }
  }, [addActivity])

  const stopSharing = useCallback(() => {
    mediaRecorder?.stop()
    mediaStream?.getTracks().forEach((track) => track.stop())
    setIsSharing(false)
    setMediaStream(null)
    setMediaRecorder(null)
    addActivity({ type: "screen-share", status: "success", content: "Screen sharing stopped" })
  }, [mediaRecorder, mediaStream, addActivity])

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `screenshare-${new Date().toISOString()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const deleteRecording = () => {
    setRecordedBlob(null)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    if (recordedBlob && videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = URL.createObjectURL(recordedBlob)
    }
  }, [recordedBlob])

  return (
    <div className="p-4 border rounded-lg bg-card text-card-foreground">
      <h3 className="font-semibold mb-2">Screen Share & Record</h3>
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        {!isSharing && !recordedBlob && <Monitor className="w-16 h-16 text-muted-foreground" />}
      </div>
      <div className="flex justify-between items-center mt-4">
        {!isSharing && !recordedBlob && (
          <Button onClick={startSharing}>
            <Monitor className="mr-2 h-4 w-4" /> Start Sharing
          </Button>
        )}
        {isSharing && (
          <Button onClick={stopSharing} variant="destructive">
            <StopCircle className="mr-2 h-4 w-4" /> Stop Sharing
          </Button>
        )}
        {recordedBlob && (
          <div className="flex gap-2">
            <Button onClick={downloadRecording} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button onClick={deleteRecording} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
