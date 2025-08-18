"use client"

import React, { useEffect, useState, useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn, uiSpacing } from "@/lib/utils"

type Context = { stage?: number; exploredCount?: number; total?: number }

const STAGE_DESCRIPTIONS = {
  1: "Discovery & Setup",
  2: "Requirements Analysis", 
  3: "Solution Design",
  4: "Implementation Planning",
  5: "Development & Testing",
  6: "Deployment & Integration",
  7: "Review & Optimization"
}

export function StageRail({ sessionId }: { sessionId?: string }) {
  const [ctx, setCtx] = useState<Context>({ stage: 1, exploredCount: 0, total: 16 })
  const [isLoading, setIsLoading] = useState(false)

  // Memoized context fetching to prevent unnecessary re-renders
  const fetchContext = useMemo(() => async () => {
    const id = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('intelligence-session-id') || undefined : undefined)
    if (!id) return
    
    setIsLoading(true)
    try {
      const res = await fetch(`/api/intelligence/context?sessionId=${id}`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      if (!res.ok) return
      const j = await res.json()
      const out = j?.output || j
      const stage = Number(out?.stage || 1)
      const explored = Number(out?.exploredCount || out?.capabilities?.length || 0)
      setCtx({ stage, exploredCount: explored, total: 16 })
    } catch (error) {
      console.warn('Failed to fetch context:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchContext()
  }, [fetchContext])

  // Listen to capability-used events to refresh quickly without polling
  useEffect(() => {
    const onUsed = () => {
      fetchContext()
    }
    
    try { 
      window.addEventListener('chat-capability-used', onUsed as EventListener) 
    } catch (error) {
      console.warn('Failed to add event listener:', error)
    }
    
    return () => { 
      try { 
        window.removeEventListener('chat-capability-used', onUsed as EventListener) 
      } catch (error) {
        console.warn('Failed to remove event listener:', error)
      }
    }
  }, [fetchContext])

  const currentStage = ctx.stage || 1
  const progressPercentage = Math.round(((ctx.exploredCount || 0) / (ctx.total || 16)) * 100)

  return (
    <aside 
      className="fixed z-20 flex flex-col items-center right-2 md:right-4 top-[72px] md:top-[88px] gap-3"
      role="complementary"
      aria-label="Session progress and stage information"
    >
      <div className="text-xs text-muted-foreground font-medium tracking-wide" aria-live="polite">Stage {currentStage} of 7</div>
      <ol className={cn("flex flex-col gap-2")} role="list">
        {Array.from({ length: 7 }).map((_, i) => {
          const stageNumber = i + 1
          const isCurrent = stageNumber === currentStage
          const isCompleted = stageNumber < currentStage
          const isUpcoming = stageNumber > currentStage
          return (
            <li key={stageNumber}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group relative">
                      <button
                        className={cn(
                          "w-11 h-11 md:w-10 md:h-10 rounded-full grid place-items-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isCurrent 
                            ? "bg-primary text-primary-foreground shadow-lg scale-110" 
                            : isCompleted
                            ? "bg-primary/80 text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                        aria-label={`Stage ${stageNumber}: ${STAGE_DESCRIPTIONS[stageNumber as keyof typeof STAGE_DESCRIPTIONS]}${isCurrent ? ' (current)' : ''}`}
                        aria-current={isCurrent ? 'step' : undefined}
                        disabled={isUpcoming}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-xs md:text-sm font-medium">{stageNumber}</span>
                        )}
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">Stage {stageNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {STAGE_DESCRIPTIONS[stageNumber as keyof typeof STAGE_DESCRIPTIONS]}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-primary font-medium">Current stage</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </li>
          )
        })}
      </ol>
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <div className="text-[10px] opacity-70">Exploration</div>
        <div className="flex items-center justify-center gap-1">
          <span>{ctx.exploredCount}</span>
          <span>of</span>
          <span>{ctx.total}</span>
        </div>
        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage} aria-label="Exploration progress">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>
      {isLoading && (
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading progress" />
      )}
    </aside>
  )
}




