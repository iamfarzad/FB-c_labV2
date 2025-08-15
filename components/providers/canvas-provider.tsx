'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

export type CanvasType = 'webpreview' | 'screen' | 'webcam' | 'video' | 'pdf' | 'code' | 'roi'

export type CanvasState = {
  type: CanvasType | null
  props?: Record<string, unknown>
}

type CanvasContextValue = {
  canvas: CanvasState
  openCanvas: (type: CanvasType, props?: Record<string, unknown>) => void
  closeCanvas: () => void
}

const CanvasContext = createContext<CanvasContextValue | null>(null)

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [canvas, setCanvas] = useState<CanvasState>({ type: null })

  const openCanvas = useCallback((type: CanvasType, props?: Record<string, unknown>) => {
    setCanvas({ type, props })
  }, [])

  const closeCanvas = useCallback(() => {
    setCanvas({ type: null })
  }, [])

  return (
    <CanvasContext.Provider value={{ canvas, openCanvas, closeCanvas }}>
      {children}
    </CanvasContext.Provider>
  )
}

export function useCanvas() {
  const ctx = useContext(CanvasContext)
  if (!ctx) throw new Error('useCanvas must be used within CanvasProvider')
  return ctx
}


