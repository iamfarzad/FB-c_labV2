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
  onClose,
  onCancel,
  onAppGenerated,
  onAnalysisComplete
}: VideoToAppProps) {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState("")
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
      const response = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, userPrompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate the application.')
      }

      const result = await response.json()
      
      if (result.appUrl) {
        setGeneratedAppUrl(result.appUrl)
        onAppGenerated(result.appUrl)
        toast({
          title: "App Generated Successfully!",
          description: "Your new learning app is ready.",
        })
      } else {
        throw new Error(result.error || 'Unknown error occurred.')
      }

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
          <CardContent className="p-4">
            <p className="text-sm font-medium">App URL:</p>
            <a href={generatedAppUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-2">
              <Link className="h-4 w-4"/>
              {generatedAppUrl}
            </a>
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
