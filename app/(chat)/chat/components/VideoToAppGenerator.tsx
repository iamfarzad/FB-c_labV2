"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Play, 
  Code, 
  FileText, 
  Download, 
  Copy, 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Youtube,
  Sparkles,
  Zap,
  Eye,
  Settings,
  Maximize2
} from "lucide-react"
import { AppPreviewModal } from "@/components/chat/modals/AppPreviewModal"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface VideoToAppGeneratorProps {
  initialVideoUrl?: string
  onAnalysisComplete?: (data: any) => void
  onClose?: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  className?: string
}

interface GenerationResult {
  spec?: string
  code?: string
  model?: string
  estimatedCost?: number
}

export const VideoToAppGenerator: React.FC<VideoToAppGeneratorProps> = ({
  initialVideoUrl = "",
  onAnalysisComplete,
  onClose,
  isExpanded = false,
  onToggleExpand,
  className
}) => {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [result, setResult] = useState<GenerationResult>({})
  const [activeTab, setActiveTab] = useState("input")
  const [error, setError] = useState<string | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/
    return youtubeRegex.test(url)
  }

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const generateSpec = useCallback(async () => {
    if (!videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube video URL",
        variant: "destructive"
      })
      return
    }

    if (!validateYouTubeUrl(videoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingSpec(true)
    setError(null)

    try {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateSpec",
          videoUrl: videoUrl.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to generate specification")
      }

      const data = await response.json()
      setResult(prev => ({ ...prev, spec: data.spec, model: data.model, estimatedCost: data.estimatedCost }))
      setActiveTab("spec")
      
      toast({
        title: "Specification Generated!",
        description: "Your app specification has been created successfully.",
      })

      if (onAnalysisComplete) {
        onAnalysisComplete({
          type: "spec",
          videoUrl,
          spec: data.spec,
          model: data.model
        })
      }
    } catch (error) {
      console.error("Error generating spec:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGeneratingSpec(false)
    }
  }, [videoUrl, toast, onAnalysisComplete])

  const generateCode = useCallback(async () => {
    if (!result.spec) {
      toast({
        title: "Error",
        description: "Please generate a specification first",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingCode(true)
    setError(null)

    try {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateCode",
          spec: result.spec
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to generate code")
      }

      const data = await response.json()
      setResult(prev => ({ ...prev, code: data.code }))
      setActiveTab("preview") // Auto-switch to preview to show the live app
      
      toast({
        title: "Code Generated!",
        description: "Your interactive learning app has been created successfully.",
      })

      if (onAnalysisComplete) {
        onAnalysisComplete({
          type: "code",
          videoUrl,
          spec: result.spec,
          code: data.code,
          model: data.model
        })
      }
    } catch (error) {
      console.error("Error generating code:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }, [result.spec, toast, onAnalysisComplete, videoUrl, result.model])

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      })
    }
  }, [toast])

  const downloadFile = useCallback((content: string, filename: string, type: string) => {
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
      description: `${type} has been downloaded`,
    })
  }, [toast])

  const videoId = extractVideoId(videoUrl)

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col w-full">
        {/* Mobile-optimized tab list */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 md:gap-0 h-auto p-1">
          <TabsTrigger value="input" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3">
            <Youtube className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Input</span>
            <span className="sm:hidden">📹</span>
          </TabsTrigger>
          <TabsTrigger value="spec" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3" disabled={!result.spec}>
            <FileText className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Spec</span>
            <span className="sm:hidden">📄</span>
            {result.spec && <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3" disabled={!result.code}>
            <Code className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Code</span>
            <span className="sm:hidden">💻</span>
            {result.code && <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3" disabled={!result.code}>
            <Eye className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">👁️</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-2 md:mt-4 min-h-0">
          <TabsContent value="input" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  YouTube Video to Learning App
                </CardTitle>
                <CardDescription>
                  Enter a YouTube video URL to generate an interactive learning application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="video-url" className="text-sm font-medium">
                    YouTube Video URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="video-url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={generateSpec}
                      disabled={isGeneratingSpec || !videoUrl.trim()}
                      className="shrink-0"
                    >
                      {isGeneratingSpec ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Spec
                        </>
                      )}
                    </Button>
                  </div>
                  {videoUrl && !validateYouTubeUrl(videoUrl) && (
                    <p className="text-sm text-destructive">Please enter a valid YouTube URL</p>
                  )}
                </div>

                {videoId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Preview</label>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        className="w-full h-full"
                        allowFullScreen
                        title="Video Preview"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">How it works:</h3>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm">Video Analysis</p>
                        <p className="text-xs text-muted-foreground">AI analyzes the video content and creates a detailed specification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm">Code Generation</p>
                        <p className="text-xs text-muted-foreground">Interactive learning app code is generated based on the specification</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm">Interactive App</p>
                        <p className="text-xs text-muted-foreground">Preview and download your custom learning application</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spec" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      App Specification
                    </CardTitle>
                    <CardDescription>
                      Generated specification for your learning app
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.model && (
                      <Badge variant="secondary" className="text-xs">
                        {result.model}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.spec || "", "Specification")}
                      disabled={!result.spec}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(result.spec || "", "app-spec.md", "Specification")}
                      disabled={!result.spec}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {result.spec ? (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                        {result.spec}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No specification generated yet</p>
                        <p className="text-sm">Generate a spec from the Input tab first</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                {result.spec && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={generateCode}
                      disabled={isGeneratingCode}
                      className="w-full"
                    >
                      {isGeneratingCode ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Code...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Interactive App Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Generated Code
                    </CardTitle>
                    <CardDescription>
                      Interactive learning app HTML/CSS/JavaScript code
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.code || "", "Code")}
                      disabled={!result.code}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(result.code || "", "learning-app.html", "Code")}
                      disabled={!result.code}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {result.code ? (
                    <div className="relative">
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                        <code>{result.code}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No code generated yet</p>
                        <p className="text-sm">Generate code from the specification first</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      App Preview
                    </CardTitle>
                    <CardDescription>
                      Live preview of your generated learning app
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewModalOpen(true)}
                      disabled={!result.code}
                    >
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Fullscreen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([result.code || ""], { type: 'text/html' })
                        const url = URL.createObjectURL(blob)
                        window.open(url, '_blank')
                      }}
                      disabled={!result.code}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {result.code ? (
                  <div className="h-full border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={result.code}
                      className="w-full h-full"
                      title="App Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No preview available</p>
                      <p className="text-sm">Generate code to see the preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Fullscreen Preview Modal */}
      <AppPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        appHtml={result.code || ""}
        appTitle="Interactive Learning App"
        onDownload={() => downloadFile(result.code || "", "learning-app.html", "Learning App")}
      />
    </div>
  )
}

export default VideoToAppGenerator
