"use client"

import type React from "react"
import { useState } from "react"
import { Play, Loader2, Download, ExternalLink, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface VideoToAppCardProps {
  onComplete: (result: VideoAppResult) => void
  onCancel: () => void
}

interface VideoAppResult {
  videoUrl: string
  title: string
  spec: string
  code: string
  summary: string
}

type ProcessingState = "idle" | "processing" | "completed" | "error"

export function VideoToAppCard({ onComplete, onCancel }: VideoToAppCardProps) {
  const { toast } = useToast()
  
  const [videoUrl, setVideoUrl] = useState("")
  const [processingState, setProcessingState] = useState<ProcessingState>("idle")
  const [result, setResult] = useState<VideoAppResult | null>(null)
  const [progress, setProgress] = useState(0)

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const validateYouTubeUrl = (url: string): boolean => {
    const videoId = extractVideoId(url)
    return videoId !== null && videoId.length === 11
  }

  const processVideo = async () => {
    if (!validateYouTubeUrl(videoUrl)) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL.",
        variant: "destructive"
      })
      return
    }

    setProcessingState("processing")
    setProgress(0)

    // Simulate processing with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      // Simulate API call to video-to-app service
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setProgress(100)

      // Mock result
      const mockResult: VideoAppResult = {
        videoUrl,
        title: "Sample Learning App",
        spec: `# Learning App Specification

## Overview
This app is designed to help users learn from the video content through interactive exercises and assessments.

## Features
- Interactive video player
- Progress tracking
- Quiz integration
- Note-taking capabilities
- Social sharing

## Technical Requirements
- React/Next.js frontend
- Node.js backend
- MongoDB database
- Video streaming integration`,
        code: `// Sample React component
import React, { useState, useEffect } from 'react'

export function VideoPlayer({ videoId }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Video player logic
  }, [videoId])

  return (
    <div className="video-player">
      <iframe
        src={\`https://www.youtube.com/embed/\${videoId}\`}
        title="Video Player"
        allowFullScreen
      />
    </div>
  )
}`,
        summary: "Successfully generated a learning app specification and sample code based on the video content. The app includes interactive features for enhanced learning experience."
      }

      setResult(mockResult)
      setProcessingState("completed")
      
      toast({
        title: "App Generated Successfully",
        description: "Your learning app has been created from the video content.",
      })
    } catch (error) {
      clearInterval(progressInterval)
      setProcessingState("error")
      toast({
        title: "Generation Failed",
        description: "Failed to generate app from video. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleComplete = () => {
    if (result) {
      onComplete(result)
    }
  }

  const downloadSpec = () => {
    if (!result) return
    
    const blob = new Blob([result.spec], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title}-spec.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCode = () => {
    if (!result) return
    
    const blob = new Blob([result.code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title}-code.js`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openVideo = () => {
    if (videoUrl) {
      window.open(videoUrl, '_blank')
    }
  }

  return (
    <ToolCardWrapper
      title="AI Video to Learning App Generator"
      description="Generate a learning app from YouTube video content"
      icon={<Play className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="videoUrl">YouTube Video URL</Label>
          <div className="flex gap-2">
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={processingState === "processing"}
              className="flex-1"
            />
            <button
              onClick={openVideo}
              className="btn-secondary"
              disabled={!videoUrl}
              aria-label="Open video in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Processing State */}
        {processingState === "processing" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Generating learning app... {progress}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        {processingState === "completed" && result && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">{result.title}</h4>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-minimal">
                <h5 className="font-semibold text-foreground mb-2">Specification</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete app specification and requirements
                </p>
                <button
                  onClick={downloadSpec}
                  className="btn-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Spec
                </button>
              </div>

              <div className="card-minimal">
                <h5 className="font-semibold text-foreground mb-2">Sample Code</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  Starter code and components
                </p>
                <button
                  onClick={downloadCode}
                  className="btn-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Code
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h5 className="font-semibold text-foreground mb-2">Generated Code Preview</h5>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                <code>{result.code.substring(0, 200)}...</code>
              </pre>
            </div>
          </div>
        )}

        {/* Error State */}
        {processingState === "error" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive">
              Failed to generate app. Please check the video URL and try again.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {processingState === "idle" && (
            <button
              onClick={processVideo}
              disabled={!validateYouTubeUrl(videoUrl)}
              className="btn-primary"
              aria-label="Generate learning app"
            >
              <Play className="w-4 h-4 mr-2" />
              Generate App
            </button>
          )}

          {processingState === "completed" && (
            <button
              onClick={handleComplete}
              className="btn-primary"
              aria-label="Complete video to app generation"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete
            </button>
          )}

          <button
            onClick={onCancel}
            className="btn-secondary"
            aria-label="Cancel video to app generation"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          <p>Paste a YouTube URL to generate a learning app with interactive features.</p>
        </div>
      </div>
    </ToolCardWrapper>
  )
} 