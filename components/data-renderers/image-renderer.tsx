"use client"

import type React from "react"
import { useState } from "react"
import { Download, Maximize2, X } from "lucide-react"
import type { ImageData } from "@/lib/data-types"

interface ImageRendererProps {
  data: ImageData
  theme: "light" | "dark"
  className?: string
}

export const ImageRenderer: React.FC<ImageRendererProps> = ({ data, theme, className = "" }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(data.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `image-${data.id}.${blob.type.split("/")[1] || "jpg"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download image:", error)
    }
  }

  if (hasError) {
    return (
      <div className={`p-4 glassmorphism rounded-xl text-center ${className}`}>
        <div className="text-red-400 mb-2">Failed to load image</div>
        <div className="text-sm text-[var(--text-primary)]/70">{data.url}</div>
      </div>
    )
  }

  return (
    <>
      <div className={`relative group glassmorphism rounded-xl overflow-hidden ${className}`}>
        {/* Image */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--glass-bg)]">
              <div className="w-8 h-8 border-2 border-[var(--color-orange-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <img
            src={data.thumbnail || data.url}
            alt={data.alt || "Generated image"}
            className="w-full h-auto max-h-96 object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
            }}
          />

          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-3 rounded-full glassmorphism hover:surface-glow transition-all duration-200"
              aria-label="View fullscreen"
            >
              <Maximize2 size={20} className="text-white" />
            </button>

            <button
              onClick={handleDownload}
              className="p-3 rounded-full glassmorphism hover:surface-glow transition-all duration-200"
              aria-label="Download image"
            >
              <Download size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Caption */}
        {data.caption && (
          <div className="p-3 border-t border-[var(--glass-border)]">
            <p className="text-sm text-[var(--text-primary)]/80">{data.caption}</p>
          </div>
        )}

        {/* Metadata */}
        {(data.width || data.height) && (
          <div className="px-3 pb-3">
            <div className="text-xs text-[var(--text-primary)]/60">
              {data.width && data.height && `${data.width} × ${data.height}`}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <img
              src={data.url || "/placeholder.svg"}
              alt={data.alt || "Generated image"}
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors duration-200"
              aria-label="Close fullscreen"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
