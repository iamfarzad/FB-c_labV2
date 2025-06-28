"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const HeroAsciiSphere: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grainCanvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const animationRef = useRef<number>()
  const isAnimatingRef = useRef<boolean>(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Detect mobile devices for performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    if (!canvasRef.current || !grainCanvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const grainCtx = grainCanvasRef.current.getContext('2d')

    if (!ctx || !grainCtx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (!containerRef.current) return

      const dpr = window.devicePixelRatio || 1
      const rect = containerRef.current.getBoundingClientRect()

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      grainCanvasRef.current!.width = rect.width * dpr
      grainCanvasRef.current!.height = rect.height * dpr
      grainCanvasRef.current!.style.width = `${rect.width}px`
      grainCanvasRef.current!.style.height = `${rect.height}px`

      ctx.scale(dpr, dpr)
      grainCtx.scale(dpr, dpr)
    }

    // Optimized ASCII sphere animation
    const render = (timestamp: number) => {
      if (!ctx || !containerRef.current || !isAnimatingRef.current) return

      if (!timeRef.current) timeRef.current = timestamp
      const deltaTime = timestamp - timeRef.current
      timeRef.current = timestamp

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.3
      const rotationSpeed = isMobile ? 0.0003 : 0.0005 // Slower on mobile
      const rotation = deltaTime * rotationSpeed

      // Draw ASCII sphere with reduced complexity on mobile
      const chars = "01#%&*+=-:."
      const charSize = isMobile ? 16 : 14
      const spacing = charSize * (isMobile ? 1.0 : 0.7) // More spacing on mobile

      // Reduced grid density on mobile for performance
      const step = isMobile ? spacing * 1.5 : spacing

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const dx = x - centerX
          const dy = y - centerY

          const angle = Math.atan2(dy, dx) + rotation
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < radius) {
            const z = Math.cos((distance / radius) * Math.PI) * radius
            const charIndex = Math.floor(((z / radius + 1) / 2) * (chars.length - 1))
            const char = chars[charIndex] || chars[0]

            const opacity = 0.2 + (z / radius) * 0.8
            const hue = 30 + (z / radius) * 20

            ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${opacity})`
            ctx.font = `${charSize}px monospace`

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(angle * 0.5)
            ctx.fillText(char, 0, charSize * 0.4)
            ctx.restore()
          }
        }
      }

      // Reduced pulsing effect on mobile
      const pulse = Math.sin(timestamp * (isMobile ? 0.001 : 0.002)) * 0.1 + 0.9
      canvas.style.transform = `scale(${pulse})`

      if (isAnimatingRef.current) {
        frameRef.current = requestAnimationFrame(render)
      }
    }

    const startAnimation = () => {
      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true
        frameRef.current = requestAnimationFrame(render)
      }
    }

    const stopAnimation = () => {
      isAnimatingRef.current = false
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }

    // Intersection Observer for viewport detection
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation()
        } else {
          stopAnimation()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    // Setup
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Start observing
    if (containerRef.current) {
      observerRef.current.observe(containerRef.current)
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      stopAnimation()
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isMobile])

  // Don't render on very small screens for performance
  if (typeof window !== 'undefined' && window.innerWidth < 480) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ zIndex: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20"
        style={{ background: 'transparent' }}
      />
      <canvas
        ref={grainCanvasRef}
        className="absolute inset-0 w-full h-full mix-blend-overlay pointer-events-none opacity-30"
      />
    </div>
  )
}
