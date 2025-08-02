'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageShell, PageHeader } from '@/components/page-shell'
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react'
import { VideoToAppGenerator } from '@/app/(chat)/chat/components/VideoToAppGenerator'
import { useState, useEffect } from 'react'

interface VideoLearningToolClientProps {
  initialVideoUrl: string
  sessionId: string
  fromChat: boolean
}

export function VideoLearningToolClient({
  initialVideoUrl,
  sessionId,
  fromChat,
}: VideoLearningToolClientProps) {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Load any saved state from session storage if coming from chat
    if (fromChat && sessionId) {
      const savedState = sessionStorage.getItem(`video2app_${sessionId}`)
      if (savedState) {
        // Handle saved state restoration
        console.log('Restoring state from chat:', savedState)
      }
    }
  }, [fromChat, sessionId])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleBackToChat = () => {
    if (fromChat) {
      router.push('/chat')
    } else {
      router.back()
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Minimal Header for Fullscreen */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground">Video to Learning App Generator</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-muted-foreground hover:text-foreground"
              >
                <Minimize2 className="h-4 w-4 mr-2" />
                Exit Fullscreen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToChat}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {fromChat ? 'Back to Chat' : 'Back'}
              </Button>
            </div>
          </div>
          
          {/* Fullscreen Content */}
          <div className="flex-1 p-4">
            <VideoToAppGenerator
              initialVideoUrl={initialVideoUrl}
              onAnalysisComplete={(data) => {
                console.log('Analysis completed:', data)
                // Save state to session storage for chat integration
                if (sessionId) {
                  sessionStorage.setItem(`video2app_${sessionId}`, JSON.stringify(data))
                }
              }}
              className="h-full"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="glass-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToChat}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {fromChat ? 'Back to Chat' : 'Back'}
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
                Video to Learning App Generator
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Transform YouTube videos into interactive learning applications
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="hidden md:flex"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <PageShell className="py-6 md:py-8">
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <CardContent className="p-0">
            <VideoToAppGenerator
              initialVideoUrl={initialVideoUrl}
              onAnalysisComplete={(data) => {
                console.log('Analysis completed:', data)
                // Save state to session storage for chat integration
                if (sessionId) {
                  sessionStorage.setItem(`video2app_${sessionId}`, JSON.stringify(data))
                }
              }}
              className="min-h-screen md:min-h-screen"
            />
          </CardContent>
        </Card>
      </PageShell>

      {/* Mobile Fullscreen Button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={toggleFullscreen}
          size="lg"
          className="rounded-full shadow-xl"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
