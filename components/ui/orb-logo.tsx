"use client"

import React, { useEffect, useRef, useLayoutEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const OrbLogo = ({ className = "" }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grainCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const scrollProgressRef = useRef(0)
  const timeRef = useRef(0)
  const isInitialized = useRef(false)
  const params = {
    rotation: 0,
    atmosphereShift: 0,
    glitchIntensity: 0,
    glitchFrequency: 0
  }
  const density = ' .:-=+*#%@'

  useLayoutEffect(() => {
    if (isInitialized.current || !containerRef.current || !canvasRef.current || !grainCanvasRef.current) return

    const canvas = canvasRef.current
    const grainCanvas = grainCanvasRef.current
    const ctx = canvas.getContext('2d')
    const grainCtx = grainCanvas.getContext('2d')
    
    if (!ctx || !grainCtx) return

    const handleResize = () => {
      if (!canvas || !grainCanvas) return
      
      const width = containerRef.current?.clientWidth || 0
      const height = containerRef.current?.clientHeight || 0
      
      canvas.width = width
      canvas.height = height
      grainCanvas.width = width
      grainCanvas.height = height
      
      if (!animationFrameRef.current) {
        render()
      }
    }

    const setupAnimations = () => {
      // Continuous sphere rotation
      gsap.to(params, {
        rotation: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "none"
      })

      // Atmospheric shift animation
      gsap.to(params, {
        atmosphereShift: 1,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })

      // Glitch intensity animation
      const glitchTl = gsap.timeline({ repeat: -1 })
      glitchTl.to(params, {
        glitchIntensity: 1,
        duration: 0.1,
        ease: "power2.inOut"
      })
      .to(params, {
        glitchIntensity: 0,
        duration: 0.1,
        ease: "power2.inOut"
      })
      .to({}, {
        duration: () => Math.random() * 3 + 1
      })

      // Glitch frequency animation
      gsap.to(params, {
        glitchFrequency: 1,
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: "none"
      })
    }


    const generateFilmGrain = (width: number, height: number, intensity = 0.15) => {
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let i = 0; i < data.length; i += 4) {
        const grain = (Math.random() - 0.5) * intensity * 255
        data[i] = Math.max(0, Math.min(255, 128 + grain))
        data[i + 1] = Math.max(0, Math.min(255, 128 + grain))
        data[i + 2] = Math.max(0, Math.min(255, 128 + grain))
        data[i + 3] = Math.abs(grain) * 3
      }
      
      return imageData
    }

    const drawGlitchedOrb = (centerX: number, centerY: number, radius: number, time: number, glitchIntensity: number) => {
      if (!ctx) return
      
      ctx.save()
      
      const shouldGlitch = Math.random() < 0.1 && glitchIntensity > 0.5
      const glitchOffsetX = shouldGlitch ? (Math.random() - 0.5) * 20 * glitchIntensity : 0
      const glitchOffsetY = shouldGlitch ? (Math.random() - 0.5) * 10 * glitchIntensity : 0
      const glitchScale = shouldGlitch ? 1 + (Math.random() - 0.5) * 0.1 * glitchIntensity : 1
      
      if (shouldGlitch) {
        ctx.translate(glitchOffsetX, glitchOffsetY)
        // Apply uniform scaling to maintain aspect ratio
        ctx.scale(glitchScale, glitchScale)
      }
      
      // Enhanced orb gradient with orange accent
      const orbGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius * 1.5
      )
      
      // Orange accent color theme
      orbGradient.addColorStop(0, 'rgba(255, 91, 4, 0.9)')
      orbGradient.addColorStop(0.2, 'rgba(255, 143, 106, 0.7)')
      orbGradient.addColorStop(0.5, 'rgba(255, 91, 4, 0.4)')
      orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      ctx.fillStyle = orbGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Bright orange center circle
      const centerRadius = radius * 0.3
      ctx.fillStyle = 'rgba(255, 91, 4, 0.8)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Glitch effects with orange theme
      if (shouldGlitch && ctx) {
        ctx.globalCompositeOperation = 'screen'
        
        // Orange-themed RGB separation
        ctx.fillStyle = `rgba(255, 91, 4, ${0.6 * glitchIntensity})`
        ctx.beginPath()
        ctx.arc(centerX + glitchOffsetX * 0.5, centerY + glitchOffsetY * 0.5, centerRadius, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = `rgba(255, 143, 106, ${0.5 * glitchIntensity})`
        ctx.beginPath()
        ctx.arc(centerX - glitchOffsetX * 0.5, centerY - glitchOffsetY * 0.5, centerRadius, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.globalCompositeOperation = 'source-over'
      }
      
      ctx.restore()
    }
    
    const render = () => {
      if (!canvas || !grainCanvas || !ctx || !grainCtx) return
      
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.4
      
      // Clear canvases
      ctx.clearRect(0, 0, width, height)
      grainCtx.clearRect(0, 0, width, height)
      
      // Update time
      timeRef.current += 0.01
      
      // Draw glitched orb
      drawGlitchedOrb(centerX, centerY, radius, timeRef.current, params.glitchIntensity)
      
      // Draw film grain
      const grainData = generateFilmGrain(width, height, 0.1)
      grainCtx.putImageData(grainData, 0, 0)
      
      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(render)
    }
    
    // Initial setup
    handleResize()
    setupAnimations()
    
    // Start animation loop
    render()
    
    // Set up resize handler
    window.addEventListener('resize', handleResize)
    
    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={`relative flex items-center ${className}`} ref={containerRef}>
      {/* Orb container with fixed size */}
      <div className="relative w-10 h-10 flex-shrink-0 mr-3">
        {/* Canvas for main orb */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            mixBlendMode: 'screen',
            opacity: 0.9,
            borderRadius: '50%',
            overflow: 'hidden'
          }}
          width={40}
          height={40}
        />
        
        {/* Canvas for grain effect */}
        <canvas
          ref={grainCanvasRef}
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          style={{
            mixBlendMode: 'overlay',
            borderRadius: '50%',
            overflow: 'hidden'
          }}
          width={40}
          height={40}
        />
      </div>
      
      {/* Text */}
      <div className="relative z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--color-orange-accent)] to-[var(--color-orange-accent-light)] bg-clip-text text-transparent leading-none">
          F.B/c
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-medium tracking-wider leading-none">
          CONSULTING
        </p>
      </div>
    </div>
  )
}
