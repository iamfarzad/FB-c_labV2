"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type ModuleProgressContextType = {
  completedModules: string[]
  currentModule: string | null
  completeModule: (slug: string, meta?: { title?: string; phase?: number }) => void
  setCurrentModule: (slug: string) => void
}

const STORAGE_KEY = 'fbc_workshop_modules_v1'

const ModuleProgressContext = createContext<ModuleProgressContextType | undefined>(undefined)

export function ModuleProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [currentModule, setCurrentModule] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setCompletedModules(parsed.completedModules || [])
        setCurrentModule(parsed.currentModule || null)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ completedModules, currentModule })
      )
    } catch {}
  }, [completedModules, currentModule])

  const completeModule = useCallback((slug: string, meta?: { title?: string; phase?: number }) => {
    setCompletedModules(prev => (prev.includes(slug) ? prev : [...prev, slug]))
    // Inform AI context with a concise snippet
    try {
      const payload = { moduleId: slug, stepId: 'module', xp: 10, moduleTitle: meta?.title }
      fetch('/api/intelligence/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {})
    } catch {}
  }, [])

  const value = useMemo(
    () => ({ completedModules, currentModule, completeModule, setCurrentModule }),
    [completedModules, currentModule, completeModule]
  )

  return React.createElement(
    ModuleProgressContext.Provider,
    { value },
    children as any
  )
}

export function useModuleProgress() {
  const ctx = useContext(ModuleProgressContext)
  if (!ctx) throw new Error('useModuleProgress must be used within ModuleProgressProvider')
  return ctx
}


