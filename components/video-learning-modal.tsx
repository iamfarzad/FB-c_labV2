"use client"

import type React from "react"
import { useState, useRef } from "react"
import { X, Play } from "lucide-react"


interface VideoLearningModalProps {
  isOpen: boolean
  onClose: () => void
  theme: "light" | "dark"
}



export const VideoLearningModal: React.FC<VideoLearningModalProps> = ({ isOpen, onClose, theme }) => {
  const [videoUrl, setVideoUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)



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

      // Redirect to the dedicated video learning tool page
      const encodedUrl = encodeURIComponent(url)
      window.open(`/video-learning-tool?videoUrl=${encodedUrl}`, '_blank')
      onClose() // Close the modal after opening the page
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsValidating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating) {
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
                disabled={isValidating}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isValidating}
              className="w-full p-3 rounded-xl glass-button text-[var(--color-text-on-orange)] disabled:opacity-50"
            >
              {isValidating ? "Validating..." : "Open Learning Tool"}
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
          </div>

          {/* Right Panel */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <Play size={48} className="text-[var(--color-orange-accent)] mx-auto mb-4 opacity-50" />
                <h3 className={`text-lg font-semibold ${textColor} mb-2`}>Interactive Learning Generator</h3>
                <p className={`${textColor} opacity-90 text-sm leading-relaxed`}>
                  Transform any YouTube video into an interactive learning experience. Our AI will create:
                </p>
                <ul className={`${textColor} opacity-80 text-sm mt-3 space-y-1 text-left`}>
                  <li>• Learning modules and quizzes</li>
                  <li>• Interactive exercises</li>
                  <li>• Progress tracking</li>
                  <li>• Key concept summaries</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
