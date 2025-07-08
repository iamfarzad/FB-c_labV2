"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2, BookOpen, Code, FileText, Presentation, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
}

export function Video2AppModal({ isOpen, onClose }: Video2AppModalProps) {
  const [videoUrl, setVideoUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [activeTab, setActiveTab] = useState("url")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoUrl) {
      setError("Please enter a YouTube URL")
      return
    }

    // Validate YouTube URL (simple validation)
    if (!videoUrl.includes("youtube.com/") && !videoUrl.includes("youtu.be/")) {
      setError("Please enter a valid YouTube URL")
      return
    }

    setError(null)
    setIsProcessing(true)

    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
    }, 3000)
  }

  const appTypes = [
    {
      id: "quiz",
      name: "Quiz App",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Interactive quiz based on video content",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "flashcards",
      name: "Flashcards",
      icon: <FileText className="h-5 w-5" />,
      description: "Study cards with key concepts",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "code",
      name: "Code Playground",
      icon: <Code className="h-5 w-5" />,
      description: "Interactive code examples from the video",
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "slides",
      name: "Summary Slides",
      icon: <Presentation className="h-5 w-5" />,
      description: "Key points as presentation slides",
      color: "from-purple-500 to-violet-600",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Video to Learning App</DialogTitle>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {!isComplete ? (
          <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">YouTube URL</TabsTrigger>
              <TabsTrigger value="upload" disabled>
                Upload Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="py-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="video-url" className="text-sm font-medium block mb-1">
                      YouTube Video URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="video-url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                    {error && <p className="text-destructive text-sm mt-1">{error}</p>}
                  </div>

                  {isProcessing && (
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">Processing video...</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Extracting audio</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Transcribing content</span>
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                        <div className="flex justify-between items-center opacity-50">
                          <span className="text-sm">Analyzing key concepts</span>
                          <div className="h-4 w-4" />
                        </div>
                        <div className="flex justify-between items-center opacity-50">
                          <span className="text-sm">Generating learning materials</span>
                          <div className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>

            <TabsContent value="upload" className="py-4">
              <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-md">
                <p className="text-muted-foreground">Video upload coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold">Learning Apps Generated!</h2>
              <p className="text-muted-foreground">Choose an app type to explore</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appTypes.map((app) => (
                <Card key={app.id} className="overflow-hidden">
                  <div className={cn("h-2 bg-gradient-to-r", app.color)} />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-primary/10">{app.icon}</div>
                      {app.name}
                    </CardTitle>
                    <CardDescription>{app.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button size="sm" className="w-full">
                      Open App
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
