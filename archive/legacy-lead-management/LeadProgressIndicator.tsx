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

  const getStatusAnimation = (status: string) => {
    switch (status) {
      case "active":
        return {
          scale: [1, 1.1, 1],
          opacity: [0.9, 1, 0.9],
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
        className={`flex flex-col items-center gap-4 ${className}`}
      >
        {stages.map((stage, index) => {
          const isActive = stage.stage === currentStage
          const isCompleted = stage.order - 1 < currentStageIndex
          return (
            <motion.div 
              key={stage.stage} 
              className="relative"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
            >
              {/* Floating shadow */}
              <div className="absolute inset-0 rounded-full bg-black/20 blur-sm translate-y-1" />
              {/* Main dot */}
              <div className={`relative w-3 h-3 rounded-full shadow-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent))]/80 shadow-[hsl(var(--accent))]/50' 
                  : isCompleted 
                    ? 'bg-gradient-to-br from-muted to-muted-foreground/20 shadow-muted/30' 
                    : 'bg-gradient-to-br from-border to-border/60 shadow-border/20'
              }`} />
            </motion.div>
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
        <motion.button
          type="button"
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen(v => !v)}
          className="inline-flex w-full items-center justify-between gap-3 rounded-full bg-background/80 backdrop-blur-xl px-4 py-3 text-xs text-muted-foreground shadow-lg border-0"
          whileTap={{ scale: 0.98 }}
        >
          <span className="inline-flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-black/20 blur-sm translate-y-0.5" />
              <span className="relative block h-2 w-2 rounded-full bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent))]/80" />
            </div>
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
        </motion.button>
        <AnimatePresence initial={false}>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="flex flex-col items-center gap-6 py-4">
                {stages.map((stage, index) => {
                  const isActive = stage.stage === currentStage
                  const isCompleted = stage.order - 1 < currentStageIndex
                  return (
                    <div key={stage.stage} className="relative">
                      {index < stages.length - 1 && (
                        <div className={`absolute top-10 left-1/2 -translate-x-1/2 h-8 w-0.5 rounded-full ${
                          isCompleted ? 'bg-gradient-to-b from-accent/60 to-accent/20' : 'bg-gradient-to-b from-border/40 to-border/10'
                        }`} />
                      )}
                      <motion.div 
                        className="relative"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                      >
                        {/* Floating shadow */}
                        <div className="absolute inset-0 rounded-full bg-black/20 blur-md translate-y-1" />
                        {/* Main circle */}
                        <div className={`relative flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent))]/80 shadow-[hsl(var(--accent))]/30' 
                            : isCompleted
                              ? 'bg-gradient-to-br from-muted to-muted-foreground/20 shadow-muted/20'
                              : 'bg-gradient-to-br from-background to-muted/40 shadow-border/20'
                        }`}>
                          <span className={`text-xs font-medium ${
                            isCompleted ? 'text-accent-foreground' : 
                            isActive ? 'text-background' : 
                            'text-muted-foreground'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop floating indicator */}
      <motion.div
        className={`hidden md:flex flex-col items-center ${variant === 'rail' ? 'gap-6' : 'gap-6'}`}
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

        {/* Rail body */}
        <div className={`relative ${
          variant === 'rail'
            ? 'rounded-full bg-background/40 backdrop-blur-xl shadow-2xl px-6 py-8'
            : ''
        }`}>
          {variant === 'rail' && (
            <>
              {/* Soft gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20 rounded-full" />
              {/* Floating connection line */}
              <div className="pointer-events-none absolute left-1/2 top-20 bottom-16 -translate-x-1/2 w-0.5 bg-gradient-to-b from-border/30 via-border/50 to-border/30 rounded-full" />
            </>
          )}

          {/* Ambient background glow */}
          {variant !== 'rail' && (
            <div className="pointer-events-none absolute inset-0 -z-10 flex justify-center">
              <div className="h-full w-32 rounded-full bg-[hsl(var(--accent))]/8 blur-3xl" />
            </div>
          )}

          {/* Vertical Stage Flow */}
          {stages.map((stage, index) => {
            const isHovered = hoveredStage === stage.stage
            const isActive = stage.status === "active"
            const isCompleted = stage.status === "completed"

            return (
              <div key={stage.stage} className={`relative group ${variant === 'rail' ? 'mb-10' : 'mb-8'}`}>
                {/* Stage Dot */}
                <motion.div
                  className="relative cursor-pointer"
                  onMouseEnter={() => setHoveredStage(stage.stage)}
                  onMouseLeave={() => setHoveredStage(null)}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 400 }}
                >
                  {/* Multiple layered shadows for floating effect */}
                  <div className="absolute inset-0 rounded-full bg-black/10 blur-sm translate-y-1" />
                  <div className="absolute inset-0 rounded-full bg-black/5 blur-lg translate-y-2" />
                  
                  {/* Ambient glow for active */}
                  {isActive && (
                    <div className="absolute -inset-4 rounded-full bg-[hsl(var(--accent))]/20 blur-xl animate-pulse" />
                  )}
                  
                  {/* Main floating circle */}
                  <motion.div
                    className={`relative w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent))]/80 shadow-[hsl(var(--accent))]/40' 
                        : isCompleted
                          ? 'bg-gradient-to-br from-muted to-muted-foreground/20 shadow-muted/30'
                          : 'bg-gradient-to-br from-background to-muted/40 shadow-border/20'
                    }`}
                    animate={getStatusAnimation(stage.status)}
                    transition={{
                      duration: isActive ? 2 : 0,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Stage Number or Check */}
                    <span className={`relative z-10 text-sm font-medium ${
                      isCompleted ? 'text-accent-foreground' : 
                      isActive ? 'text-background' : 
                      'text-muted-foreground'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </span>
                  </motion.div>

                  {/* Enhanced hover glow */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[hsl(var(--accent))]/20 blur-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isHovered ? 0.8 : 0,
                      scale: isHovered ? 1.3 : 0.8,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {/* Hover Information Panel */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-16 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                    >
                      <div className="bg-background/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 min-w-[260px] border-0">
                        {/* Floating arrow */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                          <div className="w-3 h-3 bg-background/95 rounded-sm rotate-45 shadow-lg" />
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-foreground text-sm">{stage.title}</h4>
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full bg-black/20 blur-sm translate-y-0.5" />
                              <div className={`relative w-2 h-2 rounded-full ${
                                isActive 
                                  ? 'bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--accent))]/80' 
                                  : isCompleted
                                    ? 'bg-gradient-to-br from-muted to-muted-foreground/20'
                                    : 'bg-gradient-to-br from-border to-border/60'
                              }`} />
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">{stage.desc}</p>

                          <div className="pt-2 border-t border-border/20 rounded-full">
                            <p className="text-xs text-muted-foreground/80 leading-relaxed">
                              {stage.details}
                            </p>
                          </div>

                          {/* Current Lead Data */}
                          {isActive && leadData && (
                            <div className="pt-2 border-t border-border/20 rounded-full">
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