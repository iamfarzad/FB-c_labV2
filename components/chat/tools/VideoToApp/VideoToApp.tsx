"use client"

import { useState } from "react"
import { Video, Sparkles, Loader2, Link, X } from "@/lib/icon-mapping"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { VideoToAppProps } from "./VideoToApp.types"

export function VideoToApp({ 
  mode = 'card',
  videoUrl: initialVideoUrl = "",
  onClose,
  onCancel,
  onAppGenerated,
  onAnalysisComplete
}: VideoToAppProps) {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [userPrompt, setUserPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAppUrl, setGeneratedAppUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!videoUrl || !userPrompt) {
      toast({
        title: "Missing Information",
        description: "Please provide both a video URL and a prompt.",
        variant: "destructive",
      })
      return
    }
    
    setIsGenerating(true)
    setGeneratedAppUrl(null)
    
    try {
      // Step 1: Generate specification from video
      toast({
        title: "Analyzing Video",
        description: "Generating app specification from video content...",
      })

      const specResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "generateSpec", 
          videoUrl 
        }),
      })

      if (!specResponse.ok) {
        const errorData = await specResponse.json()
        throw new Error(errorData.details || 'Failed to generate specification')
      }

      const specResult = await specResponse.json()
      
      // Step 2: Generate code from specification
      toast({
        title: "Creating App",
        description: "Generating interactive learning app code...",
      })

      const codeResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "generateCode", 
          spec: specResult.spec 
        }),
      })

      if (!codeResponse.ok) {
        const errorData = await codeResponse.json()
        throw new Error(errorData.details || 'Failed to generate application code')
      }

      const codeResult = await codeResponse.json()
      
      // Create blob URL for the generated app
      const blob = new Blob([codeResult.code], { type: 'text/html' })
      const appUrl = URL.createObjectURL(blob)
      
      setGeneratedAppUrl(appUrl)
      onAppGenerated?.(appUrl)
      
      toast({
        title: "App Generated Successfully!",
        description: "Your interactive learning app is ready to use.",
      })

    } catch (error) {
      const err = error as Error;
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const VideoToAppUI = () => (
    <div className="space-y-4">
      <Input
        placeholder="Enter video URL (e.g., YouTube)"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        disabled={isGenerating}
      />
      <Input
        placeholder="Describe the learning app you want to create"
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        disabled={isGenerating}
      />
      <Button onClick={handleGenerate} disabled={isGenerating || !videoUrl || !userPrompt} className="w-full">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate App
          </>
        )}
      </Button>
      {generatedAppUrl && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Your Interactive Learning App</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(generatedAppUrl, '_blank')}
              >
                <Link className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden h-64 bg-muted/10">
              <iframe
                src={generatedAppUrl}
                className="w-full h-full"
                title="Generated Learning App Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video to App Generator
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <VideoToAppUI />
        </DialogContent>
      </Dialog>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper
      title="Video-to-Learning App"
      description="Create an interactive learning app from a video URL."
      icon={<Video className="w-4 h-4" />}
    >
      <VideoToAppUI />
    </ToolCardWrapper>
  )
}
