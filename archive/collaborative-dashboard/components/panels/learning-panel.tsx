"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, ExternalLink, Loader2, Youtube, BookOpen, Users, Clock } from "lucide-react"

// Mock data for examples
const defaultExamples = [
  {
    id: "1",
    title: "Introduction to React Hooks",
    url: "https://www.youtube.com/watch?v=O6P86uwfdR0",
    duration: "15:30",
    difficulty: "Beginner",
    spec: "Interactive tutorial on React Hooks with code examples",
    code: "function App() { return <div>React Hooks Tutorial</div>; }",
  },
  {
    id: "2",
    title: "JavaScript Fundamentals",
    url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
    duration: "22:45",
    difficulty: "Beginner",
    spec: "Complete JavaScript basics with interactive exercises",
    code: 'console.log("Hello JavaScript!");',
  },
  {
    id: "3",
    title: "CSS Grid Layout",
    url: "https://www.youtube.com/watch?v=jV8B24rSN5o",
    duration: "18:20",
    difficulty: "Intermediate",
    spec: "Master CSS Grid with practical examples",
    code: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); }",
  },
]

interface Example {
  id: string
  title: string
  url: string
  duration: string
  difficulty: string
  spec: string
  code: string
}

// Helper functions for YouTube URL handling
const getYoutubeEmbedUrl = (url: string): string => {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ""
}

const validateYoutubeUrl = async (url: string): Promise<{ isValid: boolean; error?: string }> => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  if (!youtubeRegex.test(url)) {
    return { isValid: false, error: "Please enter a valid YouTube URL" }
  }
  return { isValid: true }
}

export function LearningPanel() {
  const [videoUrl, setVideoUrl] = useState("")
  const [urlValidating, setUrlValidating] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)
  const [selectedExample, setSelectedExample] = useState<Example | null>(null)
  const [reloadCounter, setReloadCounter] = useState(0)
  const [examples] = useState<Example[]>(defaultExamples)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !urlValidating && !contentLoading) {
      handleSubmit()
    }
  }

  const handleExampleSelect = (example: Example) => {
    if (inputRef.current) {
      inputRef.current.value = example.url
    }
    setVideoUrl(example.url)
    setSelectedExample(example)
    setReloadCounter((c) => c + 1)
  }

  const handleSubmit = async () => {
    const inputValue = inputRef.current?.value.trim() || ""

    if (!inputValue) {
      inputRef.current?.focus()
      return
    }

    if (urlValidating) return

    setUrlValidating(true)
    setVideoUrl("")
    setContentLoading(false)
    setSelectedExample(null)

    // Check if it's a pre-seeded example
    const isPreSeededExample = examples.some((example) => example.url === inputValue)

    if (isPreSeededExample) {
      proceedWithVideo(inputValue)
      return
    }

    // Validate YouTube URL
    const validationResult = await validateYoutubeUrl(inputValue)

    if (validationResult.isValid) {
      proceedWithVideo(inputValue)
    } else {
      alert(validationResult.error || "Invalid YouTube URL")
      setUrlValidating(false)
    }
  }

  const proceedWithVideo = (url: string) => {
    setVideoUrl(url)
    setReloadCounter((c) => c + 1)
    setUrlValidating(false)
    setContentLoading(true)

    // Simulate content generation
    setTimeout(() => {
      setContentLoading(false)
    }, 3000)
  }

  return (
    <div className="h-full flex gap-6 p-6 bg-slate-50">
      {/* Left Panel - Input & Video */}
      <div className="w-2/5 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <BookOpen className="w-5 h-5" />
              Video to Learning App
            </CardTitle>
            <p className="text-sm text-slate-600">Generate interactive learning apps from YouTube content</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="youtube-url">Paste a URL from YouTube:</Label>
              <Input
                ref={inputRef}
                id="youtube-url"
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={urlValidating || contentLoading}
                onKeyDown={handleKeyDown}
                onChange={() => {
                  setVideoUrl("")
                  setSelectedExample(null)
                }}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={urlValidating || contentLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {urlValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating URL...
                </>
              ) : contentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate app
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Video Container */}
        <Card className="flex-1">
          <CardContent className="p-4">
            {videoUrl ? (
              <div className="relative w-full pb-[56.25%] bg-slate-100 rounded-lg overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={getYoutubeEmbedUrl(videoUrl)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300">
                <div className="text-center text-slate-500">
                  <Youtube className="w-12 h-12 mx-auto mb-2" />
                  <p>Video will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examples Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {examples.map((example) => (
                <div
                  key={example.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedExample?.id === example.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => handleExampleSelect(example)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 text-sm">{example.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {example.duration}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {example.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Generated Content */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Learning App</span>
              {selectedExample && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  <Users className="w-3 h-3 mr-1" />
                  Interactive
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            {videoUrl ? (
              <div className="h-full">
                {contentLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-600" />
                      <p className="text-lg font-medium text-slate-900">Generating Learning App</p>
                      <p className="text-sm text-slate-600">
                        Analyzing video content and creating interactive elements...
                      </p>
                    </div>
                  </div>
                ) : selectedExample ? (
                  <div className="h-full space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h3 className="font-semibold text-emerald-900 mb-2">Learning Specification</h3>
                      <p className="text-sm text-emerald-800">{selectedExample.spec}</p>
                    </div>

                    <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">Generated Code</span>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Copy Code
                        </Button>
                      </div>
                      <pre className="text-sm text-green-400 font-mono">
                        <code>{selectedExample.code}</code>
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                        <Play className="w-4 h-4 mr-2" />
                        Launch App
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg text-slate-600">Learning app will appear here</p>
                      <p className="text-sm text-slate-500">Generated content based on your video</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed border-slate-300 rounded-lg">
                <div className="text-center text-slate-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">
                    {urlValidating ? "Validating URL..." : "Paste a YouTube URL or select an example to begin"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
