"use client"

import type React from "react"
import { useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Youtube, Loader2, CheckCircle, AlertCircle, Play, Edit, FileCode, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatContext } from "../app/chat/context/ChatProvider"
import { validateYoutubeUrl, getYoutubeEmbedUrl } from "@/lib/youtube"
import { extractLearningObjectives, extractKeyTopics } from "@/lib/educational-gemini-service"
import { EDUCATIONAL_APP_DEFINITIONS } from "@/lib/education-constants"

interface VideoToAppProps {
  onAnalysisComplete?: (data: any) => void
  className?: string
  videoUrl?: string
  onClose?: () => void
  initialVideoUrl?: string
  isExpanded?: boolean
  onToggleExpand?: () => void
}

type LoadingState = "idle" | "validating" | "loading-spec" | "loading-code" | "ready" | "error"

export const VideoToAppGenerator = forwardRef<{ getSpec: () => string; getCode: () => string }, VideoToAppProps>(
  (
    { onAnalysisComplete, className, videoUrl: initialUrl, onClose, initialVideoUrl, isExpanded, onToggleExpand },
    ref,
  ) => {
    const { addActivity } = useChatContext()
    const [videoUrl, setVideoUrl] = useState(initialUrl || initialVideoUrl || "")
    const [inputValue, setInputValue] = useState(initialUrl || initialVideoUrl || "")
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
    const [showEducationalMode, setShowEducationalMode] = useState(false)

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getSpec: () => spec,
      getCode: () => code,
    }))

    // Generate spec from video using real AI
    const generateSpecFromVideo = async (videoUrl: string): Promise<string> => {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateSpec",
          videoUrl: videoUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate spec from video")
      }

      const data = await response.json()
      return data.spec
    }

    // Generate code from spec using real AI
    const generateCodeFromSpec = async (spec: string): Promise<string> => {
      const response = await fetch("/api/video-to-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateCode",
          spec: spec,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate code from spec")
      }

      const data = await response.json()
      return data.code
    }

    // Handle submit
    const handleSubmit = async () => {
      const url = inputValue.trim()
      if (!url) return

      setLoadingState("validating")
      setError(null)

      // Validate URL
      const validation = await validateYoutubeUrl(url)
      if (!validation.isValid) {
        setError(validation.error || "Invalid YouTube URL")
        setLoadingState("error")
        return
      }

      setVideoUrl(url)
      await generateContent(url)
    }

    // Generate content using real AI
    const generateContent = async (url: string) => {
      try {
        // Add activity
        addActivity({
          type: "video_processing",
          title: "Analyzing YouTube Video",
          description: "Generating interactive learning app with AI",
          status: "in_progress",
          progress: 0,
        })

        // Generate spec
        setLoadingState("loading-spec")
        const generatedSpec = await generateSpecFromVideo(url)
        setSpec(generatedSpec)

        const objectives = extractLearningObjectives(generatedSpec)
        const topics = extractKeyTopics(generatedSpec)
        setLearningObjectives(objectives)
        setKeyTopics(topics)

        // Generate code
        setLoadingState("loading-code")
        const generatedCode = await generateCodeFromSpec(generatedSpec)
        setCode(generatedCode)
        setLoadingState("ready")
        setIframeKey((prev) => prev + 1)

        // Update activity
        addActivity({
          type: "video_complete",
          title: "Learning App Generated",
          description: "Interactive app created successfully with AI",
          status: "completed",
        })

        // Call completion handler
        if (onAnalysisComplete) {
          onAnalysisComplete({
            url,
            spec: generatedSpec,
            code: generatedCode,
          })
        }
      } catch (err: any) {
        console.error("Error generating content:", err)
        setError(err.message || "Failed to generate content")
        setLoadingState("error")

        // Update activity with error
        addActivity({
          type: "error",
          title: "Generation Failed",
          description: err.message || "Failed to generate learning app",
          status: "failed",
        })
      }
    }

    // Handle spec edit
    const handleSpecEdit = () => {
      setEditedSpec(spec)
      setIsEditingSpec(true)
    }

    // Handle spec save
    const handleSpecSave = async () => {
      const trimmedSpec = editedSpec.trim()
      if (trimmedSpec === spec) {
        setIsEditingSpec(false)
        return
      }

      try {
        setLoadingState("loading-code")
        setError(null)
        setSpec(trimmedSpec)
        setIsEditingSpec(false)
        setActiveTab("code")

        // Regenerate code
        const generatedCode = await generateCodeFromSpec(trimmedSpec)
        setCode(generatedCode)
        setLoadingState("ready")
        setIframeKey((prev) => prev + 1)
      } catch (err: any) {
        console.error("Error regenerating code:", err)
        setError(err.message || "Failed to regenerate code")
        setLoadingState("error")
      }
    }

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && loadingState === "idle") {
        handleSubmit()
      }
    }

    return (
      <div className={cn("space-y-4", className)}>
        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">AI-Powered Video to Learning App</h3>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loadingState !== "idle" && loadingState !== "error"}
              className="flex-1"
            />
            <Button
              onClick={handleSubmit}
              disabled={!inputValue || (loadingState !== "idle" && loadingState !== "error")}
              className="gap-2"
            >
              {loadingState === "validating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : loadingState === "loading-spec" || loadingState === "loading-code" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Video Preview */}
        {videoUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            <iframe
              src={getYoutubeEmbedUrl(videoUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Educational Insights */}
        {(learningObjectives.length > 0 || keyTopics.length > 0) && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                🎯 Learning Analysis
              </h4>
              <Button variant="outline" size="sm" onClick={() => setShowEducationalMode(!showEducationalMode)}>
                {showEducationalMode ? "Hide" : "Show"} Educational Apps
              </Button>
            </div>

            {learningObjectives.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Learning Objectives:</h5>
                <ul className="text-sm text-blue-600 dark:text-blue-400 list-disc list-inside space-y-1">
                  {learningObjectives.slice(0, 3).map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            {keyTopics.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Key Topics:</h5>
                <div className="flex flex-wrap gap-2">
                  {keyTopics.slice(0, 6).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Educational Apps Grid */}
        {showEducationalMode && learningObjectives.length > 0 && (
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">🎓 Interactive Learning Apps</h4>
            <div className="educational-app-grid">
              {EDUCATIONAL_APP_DEFINITIONS.map((app) => (
                <div
                  key={app.id}
                  className="educational-app-card"
                  style={{ backgroundColor: app.color }}
                  onClick={() => {
                    addActivity({
                      type: "event",
                      title: `Launched ${app.name}`,
                      description: `Started educational app: ${app.description}`,
                      status: "completed",
                    })
                  }}
                >
                  <div className="educational-app-icon">{app.icon}</div>
                  <div className="educational-app-name">{app.name}</div>
                  <div className="educational-app-description">{app.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        {(loadingState !== "idle" || spec || code) && (
          <div className="border-2 border-border rounded-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[600px] flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="render" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
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
              <div className="flex-1 overflow-hidden">
                {/* Render Tab */}
                <TabsContent value="render" className="h-full m-0">
                  {loadingState === "loading-spec" || loadingState === "loading-code" ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin mb-4" />
                      <p className="text-muted-foreground">
                        {loadingState === "loading-spec"
                          ? "AI analyzing video content..."
                          : "AI generating interactive app..."}
                      </p>
                    </div>
                  ) : loadingState === "ready" && code ? (
                    <iframe
                      key={iframeKey}
                      srcDoc={code}
                      className="w-full h-full border-none"
                      title="Generated App"
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      {error ? "Error occurred" : "Generate an app to see the preview"}
                    </div>
                  )}
                </TabsContent>

                {/* Code Tab */}
                <TabsContent value="code" className="h-full m-0 p-4 overflow-auto">
                  {code ? (
                    <pre className="text-sm">
                      <code>{code}</code>
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No code generated yet
                    </div>
                  )}
                </TabsContent>

                {/* Spec Tab */}
                <TabsContent value="spec" className="h-full m-0 p-4 overflow-auto">
                  {spec ? (
                    isEditingSpec ? (
                      <div className="h-full flex flex-col gap-4">
                        <textarea
                          value={editedSpec}
                          onChange={(e) => setEditedSpec(e.target.value)}
                          className="flex-1 w-full p-4 font-mono text-sm border rounded-md resize-none"
                          placeholder="Edit spec..."
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
                      <div className="h-full flex flex-col gap-4">
                        <pre className="flex-1 text-sm whitespace-pre-wrap">{spec}</pre>
                        <Button onClick={handleSpecEdit} className="gap-2 w-fit">
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
          </div>
        )}
      </div>
    )
  },
)

VideoToAppGenerator.displayName = "VideoToAppGenerator"

export default VideoToAppGenerator
