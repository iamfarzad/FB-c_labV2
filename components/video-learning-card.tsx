"use client"

import type React from "react"
import { Play, ExternalLink, Loader2, FileText } from "lucide-react"

interface VideoLearningCardProps {
  videoUrl: string
  videoTitle?: string
  onGenerateApp: (videoUrl: string) => void
  theme: "light" | "dark"
  isGenerating?: boolean
}

export const VideoLearningCard: React.FC<VideoLearningCardProps> = ({
  videoUrl,
  videoTitle,
  onGenerateApp,
  theme,
  isGenerating = false,
}) => {
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

  const getThumbnailUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : ""
  }

  const cardBg =
    theme === "dark"
      ? "bg-[var(--color-gunmetal-lighter)]/50 border-[var(--color-gunmetal-lighter)]"
      : "bg-[var(--color-light-silver)]/30 border-[var(--color-light-silver-darker)]"

  const textColor = theme === "dark" ? "text-[var(--color-light-silver)]" : "text-[var(--color-gunmetal)]"

  return (
    <div
      className={`rounded-xl border ${cardBg} overflow-hidden glassmorphism hover:surface-glow transition-all duration-300`}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={getThumbnailUrl(videoUrl) || "/placeholder.svg"}
          alt={videoTitle || "YouTube Video"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="p-3 rounded-full bg-red-600 text-white">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h4 className={`font-medium ${textColor} line-clamp-2`}>{videoTitle || "YouTube Video"}</h4>
          <p className={`text-sm ${textColor} opacity-70 mt-1`}>Generate an interactive learning app from this video</p>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onGenerateApp(videoUrl)}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg glass-button text-[var(--color-text-on-orange)] disabled:opacity-50 transition-all duration-300"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Generating...</span>
              </>
            ) : (
              <>
                <FileText size={16} />
                <span className="text-sm">Generate App</span>
              </>
            )}
          </button>

          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg glassmorphism hover:surface-glow transition-all duration-300 text-[var(--color-orange-accent)]"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}
