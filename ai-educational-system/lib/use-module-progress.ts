"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

type ModuleProgressContextType = {
  completedModules: string[]
  currentModule: string | null
  completeModule: (slug: string) => void
  setCurrentModule: (slug: string) => void
}

const defaultContext: ModuleProgressContextType = {
  completedModules: [],
  currentModule: null,
  completeModule: () => {},
  setCurrentModule: () => {},
}

const ModuleProgressContext = createContext<ModuleProgressContextType>(defaultContext)

export function ModuleProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [currentModule, setCurrentModule] = useState<string | null>(null)

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("moduleProgress")
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setCompletedModules(parsed.completedModules || [])
        setCurrentModule(parsed.currentModule || null)
      } catch (e) {
        console.error("Failed to parse saved progress", e)
      }
    }
  }, [])

  // Save progress to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      "moduleProgress",
      JSON.stringify({
        completedModules,
        currentModule,
      }),
    )
  }, [completedModules, currentModule])

  const completeModule = (slug: string) => {
    if (!completedModules.includes(slug)) {
      setCompletedModules((prev) => [...prev, slug])
    }
  }

  return (
    <ModuleProgressContext.Provider
      value={{
        completedModules,
        currentModule,
        completeModule,
        setCurrentModule,
      }}
    >
      {children}
    </ModuleProgressContext.Provider>
  )
}

export function useModuleProgress() {
  return useContext(ModuleProgressContext)
}

