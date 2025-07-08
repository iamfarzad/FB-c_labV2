"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Youtube, Play, BookOpen, Brain, FileText, Download, Maximize2, Minimize2, ExternalLink, Clock, User, Eye } from 'lucide-react'
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
}

interface VideoInfo {
  title: string
  duration: string
  author: string
  views: string
  thumbnail: string
  description: string
}

interface LearningApp {
  id: string
  title: string
  type: "quiz" | "flashcards" | "notes" | "summary"
  content: any
  progress: number
}

export function Video2AppModal({ isOpen, onClose }: Video2AppModalProps) {
  const [videoUrl, setVideoUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [learningApps, setLearningApps] = useState<LearningApp[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processVideo = async () => {
    if (!videoUrl.trim()) return

    setIsProcessing(true)
    setError(null)

    try {
      // Simulate video processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock video info
      const mockVideoInfo: VideoInfo = {
        title: "Introduction to React Hooks - Complete Tutorial",
        duration: "45:32",
        author: "Tech Academy",
        views: "125K",
        thumbnail: "/placeholder.svg?height=200&width=300&text=Video+Thumbnail",
        description: "Learn React Hooks from scratch including useState, useEffect, useContext, and custom hooks."
      }

      // Mock learning apps
      const mockApps: LearningApp[] = [
        {
          id: "quiz-1",
          title: "React Hooks Quiz",
          type: "quiz",
          content: {
            questions: [
              {
                question: "What is the purpose of useState hook?",
                options: ["State management", "Side effects", "Context", "Routing"],
                correct: 0
              },
              {
                question: "When does useEffect run?",
                options: ["On mount only", "On every render", "On unmount", "Depends on dependencies"],
                correct: 3
              }
            ]
          },
          progress: 0
        },
        {
          id: "flashcards-1",
          title: "React Hooks Flashcards",
          type: "flashcards",
          content: {
            cards: [
              { front: "useState", back: "Hook for managing component state" },
              { front: "useEffect", back: "Hook for handling side effects" },
              { front: "useContext", back: "Hook for consuming React context" }
            ]
          },
          progress: 0
        },
        {
          id: "notes-1",
          title: "Study Notes",
          type: "notes",
          content: {
            sections: [
              {
                title: "Introduction to Hooks",
                content: "React Hooks allow you to use state and other React features without writing a class component."
              },
              {
                title: "useState Hook",
                content: "The useState hook lets you add state to functional components."
              }
            ]
          },
          progress: 0
        },
        {
          id: "summary-1",
          title: "Video Summary",
          type: "summary",
          content: {
            keyPoints: [
              "React Hooks were introduced in React 16.8",
              "useState manages component state",
              "useEffect handles side effects",
              "Custom hooks enable code reuse"
            ],
            timeline: [
              { time: "0:00", topic: "Introduction" },
              { time: "5:30", topic: "useState Hook" },
              { time: "15:20", topic: "useEffect Hook" },
              { time: "30:45", topic: "Custom Hooks" }
            ]
          },
          progress: 0
        }
      ]

      setVideoInfo(mockVideoInfo)
      setLearningApps(mockApps)
    } catch (err) {
      setError("Failed to process video. Please check the URL and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const getAppIcon = (type: string) => {
    switch (type) {
      case "quiz": return Brain
      case "flashcards": return BookOpen
      case "notes": return FileText
      case "summary": return Eye
      default: return FileText
    }
  }

  const renderAppContent = (app: LearningApp) => {
    switch (app.type) {
      case "quiz":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold">Interactive Quiz</h3>
              <p className="text-sm text-muted-foreground">
                {app.content.questions.length} questions based on the video content
              </p>
            </div>
            <Button className="w-full" onClick={() => setActiveApp(app.id)}>
              Start Quiz
            </Button>
          </div>
        )

      case "flashcards":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold">Flashcards</h3>
              <p className="text-sm text-muted-foreground">
                {app.content.cards.length} cards for spaced repetition learning
              </p>
            </div>
            <Button className="w-full" onClick={() => setActiveApp(app.id)}>
              Study Flashcards
            </Button>
          </div>
        )

      case "notes":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold">Study Notes</h3>
              <p className="text-sm text-muted-foreground">
                Organized notes with key concepts and explanations
              </p>
            </div>
            <Button className="w-full" onClick={() => setActiveApp(app.id)}>
              View Notes
            </Button>
          </div>
        )

      case "summary":
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Eye className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-lg font-semibold">Video Summary</h3>
              <p className="text-sm text-muted-foreground">
                Key points and timeline from the video
              </p>
            </div>
            <div className="space-y-2">
              {app.content.keyPoints.slice(0, 3).map((point: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => setActiveApp(app.id)}>
              View Full Summary
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "modal-content",
        isExpanded ? "max-w-6xl h-[90vh]" : "max-w-4xl max-h-[80vh]",
        "overflow-hidden"
      )}>
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Video to Learning App Generator
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>

        <div className={cn(
          "space-y-6",
          isExpanded ? "h-full overflow-y-auto" : ""
        )}>
          {/* URL Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Paste YouTube URL here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={processVideo}
                disabled={isProcessing || !videoUrl.trim()}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Apps
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>

          {/* Video Info */}
          {videoInfo && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={videoInfo.thumbnail || "/placeholder.svg"}
                    alt="Video thumbnail"
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold line-clamp-2">{videoInfo.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {videoInfo.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {videoInfo.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {videoInfo.views} views
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Apps */}
          {learningApps.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Learning Apps</h3>
                <Badge variant="secondary">{learningApps.length} apps created</Badge>
              </div>

              <div className={cn(
                "educational-grid",
                isExpanded && "grid-cols-2"
              )}>
                {learningApps.map((app) => {
                  const IconComponent = getAppIcon(app.type)
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: learningApps.indexOf(app) * 0.1 }}
                    >
                      <Card className="educational-card h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <IconComponent className="w-6 h-6 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              {app.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{app.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {renderAppContent(app)}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Export Options */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Apps
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share Collection
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <h3 className="text-lg font-semibold mb-2">Processing Video</h3>
              <p className="text-muted-foreground">
                Analyzing content and generating learning apps...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Video2AppModal
