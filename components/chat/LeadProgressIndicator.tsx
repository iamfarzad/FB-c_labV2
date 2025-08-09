'use client';

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ConversationStage } from '@/lib/lead-manager';

interface LeadProgressIndicatorProps {
  currentStage: ConversationStage;
  leadData?: {
    name?: string;
    email?: string;
    company?: string;
  };
  className?: string;
  variant?: 'card' | 'minimal' | 'rail';
}

const stageConfig = [
  {
    stage: ConversationStage.GREETING,
    title: 'Welcome',
    desc: 'Initial greeting & introduction',
    details: 'Establishing connection and understanding your needs for AI automation and business optimization',
    order: 1
  },
  {
    stage: ConversationStage.NAME_COLLECTION,
    title: 'Introduction',
    desc: 'Getting to know you',
    details: 'Collecting your name to personalize our conversation and provide better assistance',
    order: 2
  },
  {
    stage: ConversationStage.EMAIL_CAPTURE,
    title: 'Contact Info',
    desc: 'Securing communication channel',
    details: 'Capturing email for follow-up and sending personalized recommendations',
    order: 3
  },
  {
    stage: ConversationStage.BACKGROUND_RESEARCH,
    title: 'Research',
    desc: 'Company & industry analysis',
    details: 'Analyzing your business context to provide tailored AI solutions and strategies',
    order: 4
  },
  {
    stage: ConversationStage.PROBLEM_DISCOVERY,
    title: 'Discovery',
    desc: 'Understanding your challenges',
    details: 'Identifying specific pain points and opportunities for AI-driven improvements',
    order: 5
  },
  {
    stage: ConversationStage.SOLUTION_PRESENTATION,
    title: 'Solutions',
    desc: 'Presenting tailored options',
    details: 'Customized AI automation strategies and implementation recommendations',
    order: 6
  },
  {
    stage: ConversationStage.CALL_TO_ACTION,
    title: 'Next Steps',
    desc: 'Ready to proceed',
    details: 'Scheduling consultation and defining implementation roadmap',
    order: 7
  }
]

export function LeadProgressIndicator({ currentStage, leadData, className = '', variant = 'card' }: LeadProgressIndicatorProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  
  // Calculate stage statuses based on current stage
  const currentStageIndex = stageConfig.findIndex(s => s.stage === currentStage)
  const stages = stageConfig.map((stage, index) => {
    let status = "ready"
    if (index < currentStageIndex) status = "completed"
    if (index === currentStageIndex) status = "active"
    return { ...stage, status }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-transparent"
      case "active":
        return "bg-transparent"
      case "ready":
        return "bg-transparent"
      default:
        return "bg-transparent"
    }
  }

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case "active":
        return {
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }
      case "completed":
        return {
          scale: 1,
          opacity: 1
        }
      default:
        return {}
    }
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col items-center gap-3 ${className}`}
      >
        {stages.map((stage, index) => {
          const isActive = stage.stage === currentStage
          const isCompleted = stage.order - 1 < currentStageIndex
          return (
            <div key={stage.stage} className="relative">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-[hsl(var(--accent))]' : isCompleted ? 'bg-muted' : 'bg-border'}`} />
            </div>
          )
        })}
      </motion.div>
    )
  }

  const percent = Math.round(((currentStageIndex + 1) / stages.length) * 100)

  return (
    <div className={className}>
      {/* Mobile dropdown summary */}
      <div className="md:hidden w-full">
        <button
          type="button"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen(v => !v)}
          className="inline-flex w-full items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-xs text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/40"
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            Stage {currentStageIndex + 1}/7
          </span>
          <span className="font-medium text-accent">{percent}%</span>
          <svg
            className={`h-3.5 w-3.5 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <AnimatePresence initial={false}>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <div className="flex flex-col items-center gap-5">
                {stages.map((stage, index) => {
                  const isActive = stage.stage === currentStage
                  const isCompleted = stage.order - 1 < currentStageIndex
                  return (
                    <div key={stage.stage} className="relative">
                      {index < stages.length - 1 && (
                        <div className={`absolute top-8 left-1/2 -translate-x-1/2 h-6 w-px ${isCompleted ? 'bg-accent/40' : 'bg-border/30'}`} />
                      )}
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${isActive ? 'border-accent' : 'border-border/80'} bg-transparent`}>
                        <span className={`text-[11px] font-medium ${isCompleted ? 'text-accent-foreground' : isActive ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                          {isCompleted ? '✓' : index + 1}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop floating indicator (no wrapper background) */}
      <motion.div
        className={`hidden md:flex flex-col items-center ${variant === 'rail' ? 'gap-8' : 'gap-6'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center gap-2 mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            STAGE {currentStageIndex + 1}/7
          </span>
        </motion.div>

        {/* Soft floating ambient behind the rail (no card chrome) */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
            <div className="h-full w-24 rounded-full bg-[hsl(var(--accent))]/12 blur-2xl [mask-image:radial-gradient(closest-side,black,transparent)]" />
          </div>

          {/* Vertical Stage Flow */}
          {stages.map((stage, index) => {
          const isHovered = hoveredStage === stage.stage
          const isActive = stage.status === "active"
          const isCompleted = stage.status === "completed"

            return (
              <div key={stage.stage} className={`relative group ${variant === 'rail' ? 'mb-6' : ''}`}>
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <motion.div
                  className={`absolute top-10 left-1/2 -translate-x-1/2 w-px ${variant === 'rail' ? 'h-10' : 'h-6'} ${
                    isCompleted ? 'bg-accent/40' : 'bg-border/30'
                  }`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                />
              )}

              {/* Stage Dot */}
                <motion.div
                  className="relative cursor-pointer"
                onMouseEnter={() => setHoveredStage(stage.stage)}
                onMouseLeave={() => setHoveredStage(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 400 }}
              >
                {/* Ambient glow for active */}
                {isActive && (
                  <div className="absolute -inset-3 rounded-full bg-accent/20 blur-lg" />
                )}
                {/* Outer Ring */}
                <div className={`w-11 h-11 rounded-full border ${
                  isActive ? 'border-accent' : 'border-border/70'
                } bg-transparent shadow-none flex items-center justify-center relative`}>
                  {/* Status Indicator */}
                  <motion.div
                    className={`absolute inset-0 rounded-full ${getStatusColor(stage.status)}`}
                    animate={getStatusAnimation(stage.status)}
                    transition={{
                      duration: isActive ? 1.5 : 0,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Stage Number or Check */}
                   <span className={`relative z-10 text-[12px] font-medium ${
                    isCompleted ? 'text-accent-foreground' : 
                    isActive ? 'text-accent-foreground' : 
                    'text-muted-foreground'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </span>
                </div>

                  {/* Hover Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/20 blur-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isHovered || isActive ? 1 : 0,
                    scale: isHovered || isActive ? 1.2 : 0.8,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

                {/* Hover Information Panel (opens to the left) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                  >
                      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-xl p-3 min-w-[240px]">
                        {/* Arrow (points right-to-left) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-card border-r border-t border-border/50 rotate-45" />

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">{stage.title}</h4>
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(stage.status)}`} />
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{stage.desc}</p>

                        <div className="pt-2 border-t border-border/30">
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">
                            {stage.details}
                          </p>
                        </div>

                        {/* Current Lead Data */}
                        {isActive && leadData && (
                          <div className="pt-2 border-t border-border/30">
                            {leadData.name && (
                              <p className="text-xs text-accent font-medium">
                                Current: {leadData.name}
                              </p>
                            )}
                            {leadData.email && (
                              <p className="text-xs text-muted-foreground">
                                {leadData.email}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Status */}
                        <div className="pt-1">
                          <p className="text-xs text-accent font-medium">
                            {stage.status === 'completed' ? 'Completed' : 
                             stage.status === 'active' ? 'In Progress' : 
                             'Upcoming'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )
          })}
        </div>

        {/* Progress Percentage */}
        <motion.div
          className="mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-xs font-medium text-accent">{percent}%</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
