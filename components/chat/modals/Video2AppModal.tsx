"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Video, Send } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (result: any) => void
}

export function Video2AppModal({ isOpen, onClose, onComplete }: Video2AppModalProps) {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  const processVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL to process.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setCurrentStep("Initializing...")

    try {
      // Step 1: Validate URL
      setCurrentStep("Validating video URL...")
      setProgress(10)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Step 2: Extract video info
      setCurrentStep("Extracting video information...")
      setProgress(25)

      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          generateType: "learning_app",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process video")
      }

      // Step 3: Processing transcript
      setCurrentStep("Processing video transcript...")
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 4: Generating content
      setCurrentStep("Generating learning materials...")
      setProgress(75)

      const result = await response.json()

      // Step 5: Finalizing
      setCurrentStep("Finalizing learning app...")
      setProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgress(100)
      setCurrentStep("Complete!")

      toast({
        title: "Video Processed Successfully",
        description: "Your learning app has been generated!",
      })

      onComplete(result)
      onClose()
    } catch (error: any) {
      console.error("Video processing error:", error)
      toast({
        title: "Processing Error",
        description: error.message || "Failed to process video",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setVideoUrl("")
      setProgress(0)
      setCurrentStep("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video to Learning App
              </CardTitle>
              <CardDescription>Transform any YouTube video into an interactive learning experience</CardDescription>
            </div>
            <Badge variant="secondary">Gemini AI</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">YouTube URL</Label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={processVideo}
              disabled={isProcessing || !videoUrl.trim()}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate Learning App
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Supported: YouTube videos, educational content, tutorials</p>
            <p>Generated: Lesson plans, quizzes, summaries, and interactive content</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
