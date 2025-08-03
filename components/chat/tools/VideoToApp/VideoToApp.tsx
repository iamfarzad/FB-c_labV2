"use client"

import { useState } from "react"
import { Video, Sparkles, Loader2, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { VideoToAppProps } from "./VideoToApp.types"

export function VideoToApp({ onAppGenerated }: VideoToAppProps) {
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

  return (
    <ToolCardWrapper
      title="Video-to-Learning App"
      description="Create an interactive learning app from a video URL."
      icon={Video}
    >
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
                <LinkIcon className="h-4 w-4"/>
                {generatedAppUrl}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolCardWrapper>
  )
}
