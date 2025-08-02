"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, Play, CheckCircle, Clock, AlertCircle, Copy, Download, X, Maximize2, Minimize2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { VideoToAppGenerator } from "@/app/(chat)/chat/components/VideoToAppGenerator"
import type { VideoToAppProps } from "./VideoToApp.types"
import { motion } from "framer-motion"

export function VideoToApp({
  mode = 'card',
  videoUrl = '',
  status = 'pending',
  progress = 0,
  spec,
  code,
  error,
  sessionId,
  onClose,
  onCancel,
  onAnalysisComplete
}: VideoToAppProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalExpanded, setIsModalExpanded] = useState(false)

  const handleClose = () => {
    onClose?.()
    onCancel?.()
  }

  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'analyzing':
      case 'generating':
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Play className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Queued for processing'
      case 'analyzing':
        return 'Analyzing video content...'
      case 'generating':
        return 'Generating learning app...'
      case 'completed':
        return 'Learning app generated!'
      case 'error':
        return 'Generation failed'
      default:
        return 'Ready'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'error':
        return 'destructive'
      case 'analyzing':
      case 'generating':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const openVideoToAppPage = () => {
    const params = new URLSearchParams({
      url: videoUrl,
      from: 'chat',
      ...(sessionId && { sessionId }),
      ...(status === 'pending' && { autoStart: 'true' })
    })
    
    // Save current state to session storage for seamless transition
    if (sessionId) {
      const stateData = {
        videoUrl,
        status,
        progress,
        spec,
        code,
        error,
        timestamp: Date.now()
      }
      sessionStorage.setItem(`video2app_${sessionId}`, JSON.stringify(stateData))
    }
    
    router.push(`/video-learning-tool?${params.toString()}`)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded!",
      description: `${filename} downloaded successfully`,
    })
  }

  const videoId = getYouTubeVideoId(videoUrl)
  const videoTitle = `YouTube Video ${videoId ? `(${videoId})` : ''}`

  // Card mode - embedded in chat
  if (mode === 'card') {
    return (
      <ToolCardWrapper
        title="Video to Learning App"
        description="Convert YouTube videos into interactive learning applications"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Video to Learning App
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    {videoTitle}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <Badge variant={getStatusColor()}>
                  {getStatusText()}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Video Preview Thumbnail */}
            {videoId && (
              <div className="relative">
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt="Video thumbnail"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {(status === 'analyzing' || status === 'generating') && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700 dark:text-blue-300">Progress</span>
                  <span className="text-blue-700 dark:text-blue-300">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Completed Actions */}
            {status === 'completed' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>Learning app generated successfully!</span>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {spec && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(spec, 'Specification')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Spec
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(spec, 'app-specification.txt')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download Spec
                      </Button>
                    </>
                  )}
                  
                  {code && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(code, 'Code')}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(code, 'learning-app.html')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download App
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={openVideoToAppPage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {status === 'completed' ? 'View Results' : 'Open Generator'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(videoUrl, '_blank')}
                className="shrink-0"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Video
              </Button>
              
              {status === 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Less' : 'More'}
                </Button>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && status === 'completed' && (
              <div className="space-y-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                {spec && (
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Specification Preview</h4>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                        {spec.substring(0, 200)}...
                      </pre>
                    </div>
                  </div>
                )}
                
                {code && (
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Code Preview</h4>
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                      <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                        <code>{code.substring(0, 200)}...</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </ToolCardWrapper>
    )
  }

  // Modal mode - full screen dialog
  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className={`p-0 bg-gradient-to-br from-background via-card to-background border-border transition-all duration-300 ${
        isModalExpanded ? "max-w-[95vw] h-[95vh]" : "max-w-6xl h-[85vh]"
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <DialogHeader className="flex-row items-center justify-between space-y-0 p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-6 w-6 text-accent" />
              AI Video to Learning App Generator
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalExpanded(!isModalExpanded)}
              >
                {isModalExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="p-4 flex-1 overflow-hidden">
            <VideoToAppGenerator
              initialVideoUrl={videoUrl}
              onAnalysisComplete={onAnalysisComplete}
              onClose={handleClose}
              isExpanded={isModalExpanded}
              onToggleExpand={() => setIsModalExpanded(!isModalExpanded)}
              className="h-full"
            />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
