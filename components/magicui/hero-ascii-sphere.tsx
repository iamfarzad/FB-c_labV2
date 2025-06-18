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
  const scrollProgressRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!canvasRef.current || !grainCanvasRef.current) return

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

    // ASCII sphere animation
    const render = (timestamp: number) => {
      if (!ctx || !containerRef.current) return
      
      if (!timeRef.current) timeRef.current = timestamp
      const deltaTime = timestamp - timeRef.current
      timeRef.current = timestamp
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      ctx.clearRect(0, 0, width, height)
      
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.3
      const rotationSpeed = 0.0005
      const rotation = deltaTime * rotationSpeed
      
      // Draw ASCII sphere
      const chars = "01#%&*+=-:."
      const charSize = 14
      const spacing = charSize * 0.7
      
      // Draw grid of points
      for (let y = 0; y < height; y += spacing) {
        for (let x = 0; x < width; x += spacing) {
          // Convert to polar coordinates relative to center
          let dx = x - centerX
          let dy = y - centerY
          
          // Rotate points
          const angle = Math.atan2(dy, dx) + rotation
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          // Project 3D sphere to 2D
          if (distance < radius) {
            const z = Math.cos((distance / radius) * Math.PI) * radius
            const charIndex = Math.floor(((z / radius + 1) / 2) * (chars.length - 1))
            const char = chars[charIndex] || chars[0]
            
            // Calculate opacity and color based on z-depth
            const opacity = 0.2 + (z / radius) * 0.8
            const hue = 30 + (z / radius) * 20 // Orange to yellow gradient
            
            ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${opacity})`
            ctx.font = `${charSize}px monospace`
            
            // Draw character with perspective
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(angle * 0.5) // Slight rotation for dynamism
            ctx.fillText(char, 0, charSize * 0.4)
            ctx.restore()
          }
        }
      }
      
      // Add subtle pulsing effect
      const pulse = Math.sin(timestamp * 0.002) * 0.1 + 0.9
      canvas.style.transform = `scale(${pulse})`
      
      frameRef.current = requestAnimationFrame(render)
    }



    // Setup
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Start animation
    frameRef.current = requestAnimationFrame(render)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

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
