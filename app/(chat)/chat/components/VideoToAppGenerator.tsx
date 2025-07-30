"use client"

import type React from "react"
import { useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Youtube,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  Edit,
  FileCode,
  FileText,
  Sparkles,
  Lightbulb,
  ListChecks,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatContext } from "../context/ChatProvider"
import { validateYoutubeUrl, getYoutubeEmbedUrl } from "@/lib/youtube"
import { extractLearningObjectives, extractKeyTopics } from "@/lib/educational-gemini-service"
import {
  Tooltip, // Added Tooltip
  TooltipContent, // Added TooltipContent
  TooltipProvider, // Added TooltipProvider
  TooltipTrigger, // Added TooltipTrigger
} from "@/components/ui/tooltip"

interface VideoToAppProps {
  onAnalysisComplete?: (data: any) => void
  className?: string
  onClose?: () => void
}

type LoadingState = "idle" | "validating" | "loading-spec" | "loading-code" | "ready" | "error"

export const VideoToAppGenerator = forwardRef<{ getSpec: () => string; getCode: () => string }, VideoToAppProps>(
  ({ onAnalysisComplete, className, onClose }, ref) => {
    const { addActivity } = useChatContext()
    const [videoUrl, setVideoUrl] = useState("")
    const [inputValue, setInputValue] = useState("")
    const [loadingState, setLoadingState] = useState<LoadingState>("idle")
    const [error, setError] = useState<string | null>(null)
    const [spec, setSpec] = useState<string>("")
    const [code, setCode] = useState<string>("")
    const [isEditingSpec, setIsEditingSpec] = useState(false)
    const [editedSpec, setEditedSpec] = useState("")
    const [activeTab, setActiveTab] = useState("render")
    const [iframeKey, setIframeKey] = useState(0)
    const [learningObjectives, setLearningObjectives] = useState<string[]>([])
    const [keyTopics, setKeyTopics] = useState<string[]>([])

    useImperativeHandle(ref, () => ({ getSpec: () => spec, getCode: () => code }))

    const generateSpecFromVideo = async (videoUrl: string): Promise<string> => {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateSpec", videoUrl }),
      })
      if (!response.ok) throw new Error("Failed to generate spec")
      const data = await response.json()
      return data.spec
    }

    const generateCodeFromSpec = async (spec: string): Promise<string> => {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateCode", spec }),
      })
      if (!response.ok) throw new Error("Failed to generate code")
      const data = await response.json()
      return data.code
    }

    const handleSubmit = async () => {
      const url = inputValue.trim()
      if (!url) return

      setLoadingState("validating")
      setError(null)
      setSpec("")
      setCode("")
      setLearningObjectives([])
      setKeyTopics([])

      const validation = await validateYoutubeUrl(url)
      if (!validation.isValid) {
        setError(validation.error || "Invalid YouTube URL")
        setLoadingState("error")
        return
      }

      setVideoUrl(url)
      await generateContent(url)
    }

    const generateContent = async (url: string) => {
      try {
        addActivity({ type: "video_processing", title: "Analyzing YouTube Video", status: "in_progress" })
        setLoadingState("loading-spec")
        const generatedSpec = await generateSpecFromVideo(url)
        setSpec(generatedSpec)
        setLearningObjectives(extractLearningObjectives(generatedSpec))
        setKeyTopics(extractKeyTopics(generatedSpec))

        setLoadingState("loading-code")
        const generatedCode = await generateCodeFromSpec(generatedSpec)
        setCode(generatedCode)
        setLoadingState("ready")
        setIframeKey((prev) => prev + 1)

        addActivity({ type: "video_complete", title: "Learning App Generated", status: "completed" })
        onAnalysisComplete?.({ url, spec: generatedSpec, code: generatedCode })
      } catch (err: any) {
        setError(err.message || "Failed to generate content")
        setLoadingState("error")
        addActivity({ type: "video_processing", title: "Video Processing Failed", status: "error" })
      }
    }

    const handleSpecSave = async () => {
      try {
        setLoadingState("loading-code")
        setError(null)
        setSpec(editedSpec)
        setIsEditingSpec(false)
        setActiveTab("code")
        const generatedCode = await generateCodeFromSpec(editedSpec)
        setCode(generatedCode)
        setLoadingState("ready")
        setIframeKey((prev) => prev + 1)
      } catch (err: any) {
        setError(err.message || "Failed to regenerate code")
        setLoadingState("error")
      }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (loadingState === "idle" || loadingState === "error")) {
        handleSubmit()
      }
    }

    const isLoading =
      loadingState === "validating" || loadingState === "loading-spec" || loadingState === "loading-code"

    return (
      <div className={cn("flex flex-col h-full", className)}>
        <header className="flex items-center gap-3 p-4 border-b">
          <Youtube className="h-6 w-6 text-red-500" />
          <h2 className="text-lg font-semibold">AI Video to Learning App</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto gap-1 bg-transparent">
                  <Info className="h-4 w-4" />
                  V2A
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate a learning application from a YouTube video.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto">
          {/* Left Column: Input & Analysis */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">YouTube Video URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste YouTube URL here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSubmit} disabled={!inputValue || isLoading} className="gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {videoUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <iframe
                  src={getYoutubeEmbedUrl(videoUrl)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {(learningObjectives.length > 0 || keyTopics.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI Learning Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {learningObjectives.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        Learning Objectives
                      </h3>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        {learningObjectives.slice(0, 3).map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {keyTopics.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Key Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {keyTopics.slice(0, 6).map((topic, i) => (
                          <span key={i} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Generated App */}
          <div className="flex flex-col">
            {(isLoading || spec || code) && (
              <Card className="flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b">
                    <TabsTrigger value="render" className="gap-2">
                      <Play className="h-4 w-4" />
                      Render
                    </TabsTrigger>
                    <TabsTrigger value="code" className="gap-2">
                      <FileCode className="h-4 w-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="spec" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Spec
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-hidden relative">
                    <TabsContent value="render" className="h-full m-0">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full bg-muted">
                          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                          <p className="text-muted-foreground">AI is building your app...</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {loadingState === "loading-spec" ? "Analyzing video..." : "Generating code..."}
                          </p>
                        </div>
                      ) : code ? (
                        <iframe
                          key={iframeKey}
                          srcDoc={code}
                          className="w-full h-full border-none"
                          title="Generated App"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground bg-muted">
                          {error ? "Error occurred" : "App preview will appear here"}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="code" className="h-full m-0 p-0 overflow-auto">
                      {code ? (
                        <pre className="text-xs p-4">
                          <code>{code}</code>
                        </pre>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No code generated yet
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="spec" className="h-full m-0 flex flex-col">
                      {spec ? (
                        isEditingSpec ? (
                          <div className="h-full flex flex-col gap-2 p-4">
                            <Textarea
                              value={editedSpec}
                              onChange={(e) => setEditedSpec(e.target.value)}
                              className="flex-1 w-full font-mono text-xs resize-none"
                            />
                            <div className="flex gap-2">
                              <Button onClick={handleSpecSave} className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Save & Regenerate
                              </Button>
                              <Button variant="outline" onClick={() => setIsEditingSpec(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col gap-2 p-4">
                            <pre className="flex-1 text-sm whitespace-pre-wrap overflow-auto">{spec}</pre>
                            <Button
                              onClick={() => {
                                setEditedSpec(spec)
                                setIsEditingSpec(true)
                              }}
                              className="gap-2 w-fit"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Spec
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No spec generated yet
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  },
)

VideoToAppGenerator.displayName = "VideoToAppGenerator"

export default VideoToAppGenerator
