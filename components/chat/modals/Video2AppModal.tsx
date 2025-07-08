"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VideoToAppGenerator } from "@/components/video-to-app-generator"
import { EDUCATIONAL_APP_DEFINITIONS } from "@/lib/education-constants"
import { Button } from "@/components/ui/button"

interface Video2AppModalProps {
  isOpen: boolean
  onClose: () => void
  initialVideoUrl?: string
}

export const Video2AppModal = ({ isOpen, onClose, initialVideoUrl }: Video2AppModalProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showEducationalApps, setShowEducationalApps] = useState(false)
  const [selectedEducationalApp, setSelectedEducationalApp] = useState<string | null>(null)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={isExpanded ? "max-w-7xl h-[90vh]" : "max-w-5xl h-[80vh]"}
        aria-describedby="video2app-description"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Video to Learning App Generator</DialogTitle>
          <DialogDescription id="video2app-description">
            Transform any YouTube video into an interactive learning application using AI
          </DialogDescription>
        </DialogHeader>

        <div className="h-full">
          <VideoToAppGenerator
            className="h-full"
            onClose={onClose}
            initialVideoUrl={initialVideoUrl}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(!isExpanded)}
          />
        </div>

        {showEducationalApps && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Educational Learning Apps</h3>
              <Button variant="outline" size="sm" onClick={() => setShowEducationalApps(false)}>
                Hide Apps
              </Button>
            </div>

            <div className="educational-app-grid">
              {EDUCATIONAL_APP_DEFINITIONS.map((app) => (
                <div
                  key={app.id}
                  className="educational-app-card"
                  style={{ backgroundColor: app.color }}
                  onClick={() => setSelectedEducationalApp(app.id)}
                >
                  <div className="educational-app-icon">{app.icon}</div>
                  <div className="educational-app-name">{app.name}</div>
                  <div className="educational-app-description">{app.description}</div>
                </div>
              ))}
            </div>

            {selectedEducationalApp && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Selected: {EDUCATIONAL_APP_DEFINITIONS.find((app) => app.id === selectedEducationalApp)?.name}
                </p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    // This will be handled by the educational content system
                    console.log("Launch educational app:", selectedEducationalApp)
                  }}
                >
                  Launch Learning Experience
                </Button>
              </div>
            )}
          </div>
        )}

        {!showEducationalApps && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowEducationalApps(true)} className="gap-2">
              🎓 Show Educational Apps
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
