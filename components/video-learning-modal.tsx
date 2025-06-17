"use client"

import type React from "react"
import { useState, useRef } from "react"
import { X, Play, Loader2, FileText, Code, Eye } from "lucide-react"
import { parseJSON, parseHTML } from "@/lib/parse"
import { SPEC_FROM_VIDEO_PROMPT, CODE_REGION_OPENER, CODE_REGION_CLOSER, SPEC_ADDENDUM } from "@/lib/prompts"
import { generateText } from "@/lib/text-generation"

interface VideoLearningModalProps {
  isOpen: boolean
  onClose: () => void
  theme: "light" | "dark"
}

interface Example {
  title: string
  url: string
  spec: string
  code: string
  description?: string
  category?: string
}

export const VideoLearningModal: React.FC<VideoLearningModalProps> = ({ isOpen, onClose, theme }) => {
  const [videoUrl, setVideoUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<{
    spec: string
    code: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState<"render" | "code" | "spec">("render")
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const examples: Example[] = [
    {
      title: "Interactive Binary Tree Visualizer",
      url: "https://www.youtube.com/watch?v=example1",
      spec: "Learn binary tree data structures through interactive visualization",
      code: "<h1>Binary Tree Explorer</h1>",
      description: "Understand how binary trees work with drag-and-drop nodes",
      category: "computer-science",
    },
    {
      title: "Physics Wave Simulator",
      url: "https://www.youtube.com/watch?v=example2", 
      spec: "Explore wave mechanics with interactive controls",
      code: "<h1>Wave Physics Lab</h1>",
      description: "Visualize how frequency and amplitude affect wave behavior",
      category: "physics",
    },
    {
      title: "Chemistry Molecule Builder",
      url: "https://www.youtube.com/watch?v=example3",
      spec: "Build molecules and see chemical bonding in action",
      code: "<h1>Molecular Chemistry Lab</h1>",
      description: "Create compounds and understand atomic interactions",
      category: "chemistry",
    },
  ]

  const getYouTubeVideoId = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.hostname === "www.youtube.com" || parsedUrl.hostname === "youtube.com") {
        const videoId = parsedUrl.searchParams.get("v")
        if (videoId && videoId.length === 11) {
          return videoId
        }
      }
      if (parsedUrl.hostname === "youtu.be") {
        const videoId = parsedUrl.pathname.substring(1)
        if (videoId && videoId.length === 11) {
          return videoId
        }
      }
    } catch (e) {
      console.warn("URL parsing failed:", e)
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return match[2]
    }
    return null
  }

  const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url)
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  const validateYoutubeUrl = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
    if (getYouTubeVideoId(url)) {
      return { isValid: true }
    }
    return { isValid: false, error: "Invalid YouTube URL" }
  }

  const generateSpecFromVideo = async (videoUrl: string): Promise<string> => {
    console.log("=== GENERATING SPEC FROM VIDEO ===")
    console.log("Video URL:", videoUrl)
    
    try {
      // Generate a random educational topic for demonstration
      const topics = [
        "data structures and algorithms (like binary trees or sorting)",
        "physics concepts (like wave mechanics or gravity)",
        "mathematics (like calculus derivatives or geometry)",
        "chemistry (like molecular bonding or periodic table)",
        "biology (like cell division or DNA structure)",
        "computer science (like networking protocols or databases)",
        "astronomy (like planetary motion or star formation)",
        "economics (like supply and demand or market forces)"
      ]
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)]
      
      const enhancedPrompt = `${SPEC_FROM_VIDEO_PROMPT}

Please create an interactive learning app focused on: ${randomTopic}

The app should:
1. Be highly interactive and engaging
2. Include visual demonstrations
3. Allow users to experiment and see results
4. Have clear explanations of concepts
5. Be suitable for learners at an intermediate level

Generate a creative and educational web app specification.`

      const specResponse = await generateText({
        modelName: "gemini-2.0-flash-exp",
        prompt: enhancedPrompt,
        videoUrl: videoUrl,
      })

      console.log("Raw spec response:", specResponse)
      
      const parsedResponse = parseJSON(specResponse)
      console.log("Parsed response:", parsedResponse)
      
      let spec = parsedResponse.spec || specResponse
      spec += SPEC_ADDENDUM
      return spec
    } catch (error) {
      console.error("Error generating spec:", error)
      throw new Error(`Failed to generate specification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const generateCodeFromSpec = async (spec: string): Promise<string> => {
    const codeResponse = await generateText({
      modelName: "gemini-2.0-flash-exp",
      prompt: spec,
    })

    const code = parseHTML(codeResponse, CODE_REGION_OPENER, CODE_REGION_CLOSER)
    return code
  }

  const handleSubmit = async () => {
    const url = inputRef.current?.value.trim() || ""
    if (!url) return

    setIsValidating(true)
    setError(null)

    try {
      const validation = await validateYoutubeUrl(url)
      if (!validation.isValid) {
        setError(validation.error || "Invalid YouTube URL")
        setIsValidating(false)
        return
      }

      setVideoUrl(url)
      setIsValidating(false)
      setIsGenerating(true)

      // Generate specification
      const spec = await generateSpecFromVideo(url)

      // Generate code from specification
      const code = await generateCodeFromSpec(spec)

      setGeneratedContent({ spec, code })
      setActiveTab("render")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsValidating(false)
      setIsGenerating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating && !isGenerating) {
      handleSubmit()
    }
  }

  if (!isOpen) return null

  const modalBg =
    theme === "dark"
      ? "bg-[var(--color-gunmetal)]/95 border-[var(--color-gunmetal-lighter)]"
      : "bg-white/95 border-[var(--color-light-silver-darker)]"

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center glassmorphism">
      <div
        className={`w-full max-w-6xl h-[90vh] rounded-2xl ${modalBg} border shadow-2xl flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl glassmorphism border">
              <Play size={18} className="text-[var(--color-orange-accent)]" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textColor} gradient-text`}>Video Learning Generator</h2>
              <p className={`text-sm ${textColor} opacity-90`}>
                Generate interactive learning apps from YouTube videos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glassmorphism hover:surface-glow transition-all duration-300 text-[var(--text-primary)] group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-1/3 p-6 border-r border-[var(--glass-border)] flex flex-col space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-2`}>YouTube URL:</label>
              <input
                ref={inputRef}
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-3 rounded-xl glassmorphism focus:ring-2 focus:ring-[var(--color-orange-accent)]/30 text-[var(--text-primary)]"
                onKeyDown={handleKeyDown}
                disabled={isValidating || isGenerating}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isValidating || isGenerating}
              className="w-full p-3 rounded-xl glass-button text-[var(--color-text-on-orange)] disabled:opacity-50"
            >
              {isValidating ? "Validating..." : isGenerating ? "Generating..." : "Generate Learning App"}
            </button>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
            )}

            {/* Video Preview */}
            {videoUrl && (
              <div className="aspect-video rounded-xl overflow-hidden glassmorphism">
                <iframe src={getYoutubeEmbedUrl(videoUrl)} className="w-full h-full" allowFullScreen />
              </div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Loader2 size={32} className="animate-spin text-[var(--color-orange-accent)] mx-auto mb-2" />
                  <p className={`text-sm ${textColor}`}>Generating learning content...</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col">
            {generatedContent && (
              <>
                {/* Tabs */}
                <div className="flex border-b border-[var(--glass-border)]">
                  {[
                    { id: "render", label: "Preview", icon: Eye },
                    { id: "code", label: "Code", icon: Code },
                    { id: "spec", label: "Specification", icon: FileText },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        activeTab === id
                          ? "bg-[var(--color-orange-accent)] text-white"
                          : `${textColor} hover:bg-[var(--color-orange-accent)]/10`
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === "render" && (
                    <iframe
                      ref={iframeRef}
                      srcDoc={generatedContent.code}
                      className="w-full h-full border-none"
                      sandbox="allow-scripts"
                    />
                  )}

                  {activeTab === "code" && (
                    <div className="h-full overflow-auto p-4">
                      <pre className={`text-sm ${textColor} whitespace-pre-wrap font-mono`}>
                        {generatedContent.code}
                      </pre>
                    </div>
                  )}

                  {activeTab === "spec" && (
                    <div className="h-full overflow-auto p-4">
                      <div className={`${textColor} whitespace-pre-wrap leading-relaxed`}>{generatedContent.spec}</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!generatedContent && !isGenerating && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Play size={48} className="text-[var(--color-orange-accent)] mx-auto mb-4 opacity-50" />
                  <p className={`${textColor} opacity-90`}>Enter a YouTube URL to generate learning content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
