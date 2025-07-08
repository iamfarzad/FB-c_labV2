"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Upload, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { activityLogger } from "@/lib/activity-logger"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalysisComplete: (result: { spec: string; code: string }) => void
}

export function Video2AppModal({ isOpen, onClose, onAnalysisComplete }: Video2AppModalProps) {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ spec: string; code: string } | null>(null)

  const processVideo = useCallback(async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL to analyze",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    activityLogger.log({
      type: "video_analysis",
      title: "Video Processing Started",
      description: `Analyzing video: ${videoUrl}`,
      status: "in_progress",
    })

    try {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          customPrompt: customPrompt || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process video")
      }

      const data = await response.json()
      setResult(data)
      onAnalysisComplete(data)

      activityLogger.log({
        type: "video_analysis",
        title: "Video Processing Complete",
        description: "Learning app generated successfully",
        status: "completed",
      })

      toast({
        title: "Video Processed!",
        description: "Learning app has been generated from the video content",
      })
    } catch (error: any) {
      console.error("Video processing error:", error)
      activityLogger.log({
        type: "error",
        title: "Video Processing Failed",
        description: error.message,
        status: "failed",
      })
      toast({
        title: "Processing Failed",
        description: error.message || "Could not process the video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [videoUrl, customPrompt, onAnalysisComplete, toast])

  const resetForm = useCallback(() => {
    setVideoUrl("")
    setCustomPrompt("")
    setResult(null)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video to Learning App Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transform Video into Interactive Learning</CardTitle>
                  <CardDescription>
                    Provide a YouTube URL and we'll create a structured learning experience with quizzes, key takeaways,
                    and interactive elements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">YouTube URL *</Label>
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
                    <Textarea
                      id="custom-prompt"
                      placeholder="e.g., Focus on technical concepts, create beginner-friendly content, emphasize practical applications..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      disabled={isProcessing}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={processVideo}
                    disabled={isProcessing || !videoUrl.trim()}
                    className="w-full"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {isProcessing ? "Processing Video..." : "Generate Learning App"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">What You'll Get:</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Structured lesson plan with key learning objectives</li>
                    <li>• Interactive quizzes and knowledge checks</li>
                    <li>• Timestamped key moments and takeaways</li>
                    <li>• Practical exercises and real-world applications</li>
                    <li>• Progress tracking and completion metrics</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Learning App Generated Successfully!
                  </CardTitle>
                  <CardDescription>
                    Your video has been transformed into an interactive learning experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Learning Specification</h4>
                      <div className="bg-muted p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{result.spec}</pre>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Implementation Code</h4>
                      <div className="bg-muted p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono">{result.code}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={resetForm} variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Process Another Video
                    </Button>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(result.code)
                        toast({ title: "Code Copied", description: "Implementation code copied to clipboard" })
                      }}
                      variant="secondary"
                    >
                      Copy Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
