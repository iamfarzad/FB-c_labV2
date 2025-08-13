"use client"

import React, { useCallback, useEffect, useRef } from "react"
import ReactCanvasConfetti from "react-canvas-confetti"
import type confetti from "canvas-confetti"

type ConfettiProps = {
  isActive: boolean
  onComplete?: () => void
}

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const refAnimationInstance = useRef<confetti.CreateTypes | null>(null)
  const [isAnimationComplete, setIsAnimationComplete] = React.useState(false)

  const getInstance = useCallback((instance: confetti.CreateTypes | null) => {
    refAnimationInstance.current = instance
  }, [])

  const makeShot = useCallback((particleRatio: number, opts: confetti.Options) => {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7, x: 0.5 },
        particleCount: Math.floor(200 * particleRatio),
      })
    }
  }, [])

  const fire = useCallback(() => {
    if (isAnimationComplete) return

    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
      decay: 0.91,
      scalar: 0.8,
    })

    makeShot(0.2, {
      spread: 60,
      decay: 0.92,
      scalar: 1.2,
    })

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 1,
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    })

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
      decay: 0.91,
      scalar: 1,
    })

    setTimeout(() => {
      setIsAnimationComplete(true)
      if (onComplete) onComplete()
    }, 1500)
  }, [makeShot, isAnimationComplete, onComplete])

  useEffect(() => {
    if (isActive && !isAnimationComplete) {
      fire()
    }

    return () => {
      setIsAnimationComplete(false)
    }
  }, [isActive, fire, isAnimationComplete])

  return (
    <ReactCanvasConfetti
      refConfetti={getInstance}
      style={{
        position: "fixed",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    />
  )
}

