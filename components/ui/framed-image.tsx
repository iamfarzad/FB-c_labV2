"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Maximize2, X, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface FramedImageProps {
  src: string
  alt?: string
  className?: string
  frameType?: "classic" | "modern" | "polaroid"
  interactive?: boolean
  enableDownload?: boolean
  enableFullscreen?: boolean
  animationType?: "hover" | "click" | "both"
}

export function FramedImage({
  src,
  alt = "",
  className = "",
  frameType = "modern",
  interactive = true,
  enableDownload = true,
  enableFullscreen = true,
  animationType = "hover",
}: FramedImageProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `image-${Date.now()}.${blob.type.split("/")[1] || "jpg"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download image:", error)
    }
  }

  const toggleFullscreen = () => {
    if (!enableFullscreen) return
    setIsFullscreen(!isFullscreen)
  }

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Animation variants
  const hoverVariants = {
    hover: {
      scale: 1.02,
      transition: { type: "spring", stiffness: 300 }
    },
    tap: {
      scale: 0.98,
    }
  }

  const frameVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: { opacity: 0, y: -20 }
  }

  const Frame = {
    classic: "border-4 border-amber-800 bg-amber-50 p-2 shadow-lg",
    modern: "bg-white rounded-xl overflow-hidden shadow-xl",
    polaroid: "bg-white p-4 pb-8 shadow-md"
  }[frameType]

  return (
    <>
      <motion.div
        className={cn(
          "relative inline-block transition-all duration-300",
          Frame,
          className
        )}
        onHoverStart={() => interactive && setIsHovered(true)}
        onHoverEnd={() => interactive && setIsHovered(false)}
        onClick={() => interactive && animationType !== "hover" && setIsClicked(!isClicked)}
        whileHover={interactive && animationType !== "click" ? "hover" : undefined}
        whileTap={interactive ? "tap" : undefined}
        variants={hoverVariants}
        initial="initial"
        animate={isClicked ? "tap" : "initial"}
      >
        {/* Image container */}
        <div className="relative overflow-hidden">
          <img
            src={src}
            alt={alt}
            className={cn(
              "w-full h-auto block transition-transform duration-500",
              isLoading ? "blur-sm" : "blur-0"
            )}
            style={{ transform: `rotate(${rotation}deg) scale(${scale})` }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
              <RotateCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}

          {/* Interactive controls */}
          {interactive && (isHovered || isClicked) && (
            <motion.div 
              className="absolute inset-0 bg-black/20 flex items-center justify-center gap-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered || isClicked ? 1 : 0 }}
            >
              {enableDownload && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload()
                  }}
                  className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Download image"
                >
                  <Download className="w-5 h-5 text-gray-800" />
                </button>
              )}
              {enableFullscreen && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFullscreen()
                  }}
                  className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="View fullscreen"
                >
                  <Maximize2 className="w-5 h-5 text-gray-800" />
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Polaroid style caption */}
        {frameType === "polaroid" && alt && (
          <p className="text-center mt-2 text-gray-700 font-medium">{alt}</p>
        )}
      </motion.div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setIsFullscreen(false)
              }}
              aria-label="Close fullscreen"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <img 
                src={src} 
                alt={alt} 
                className="max-h-[90vh] max-w-full object-contain"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black/70 p-2 rounded-full">
                <button 
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                  aria-label="Rotate image"
                >
                  <RotateCw className="w-6 h-6 text-white" />
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                  aria-label="Download image"
                >
                  <Download className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
