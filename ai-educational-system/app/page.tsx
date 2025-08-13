"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Lock, CheckCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { getAllModules } from "@/lib/modules"
import { useModuleProgress } from "@/lib/use-module-progress"

export default function Home() {
  const router = useRouter()
  const modules = getAllModules()
  const { completedModules, currentModule, completeModule } = useModuleProgress()
  const [showIntro, setShowIntro] = useState(true)
  const [progress, setProgress] = useState(0)

  // Calculate overall progress
  useEffect(() => {
    const totalModules = modules.length
    const completed = completedModules.length
    setProgress((completed / totalModules) * 100)
  }, [completedModules, modules.length])

  const startJourney = () => {
    setShowIntro(false)
  }

  const goToModule = (slug: string) => {
    router.push(`/modules/${slug}`)
  }

  // Group modules by phase
  const modulesByPhase = modules.reduce(
    (acc, module) => {
      if (!acc[module.phase]) {
        acc[module.phase] = []
      }
      acc[module.phase].push(module)
      return acc
    },
    {} as Record<number, typeof modules>,
  )

  // Get all phases
  const phases = Object.keys(modulesByPhase)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/5 to-primary/10 blur-3xl" />
      </div>

      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="intro"
            className="min-h-screen flex flex-col items-center justify-center p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center space-y-6 px-4 max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
                Understanding <span className="text-primary">AI</span> Visually
              </h1>
              <p className="text-xl text-muted-foreground">An interactive journey through the world of AI and LLMs</p>
              <div className="flex justify-center gap-4 pt-6">
                <Button size="lg" className="rounded-full px-8" onClick={startJourney}>
                  Begin Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <p className="text-muted-foreground mb-2">Complete interactive modules to unlock new concepts</p>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto animate-bounce">
                <path
                  d="M12 5V19M12 19L5 12M12 19L19 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="journey"
            className="container mx-auto px-4 py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Your AI Learning Journey</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {completedModules.length} of {modules.length} completed
                  </span>
                  <Progress value={progress} className="w-32" />
                </div>
              </div>

              <div className="space-y-12">
                {phases.map((phase) => {
                  const phaseModules = modulesByPhase[phase]
                  const phaseColors = {
                    1: { bg: "bg-blue-500/20", text: "text-blue-500" },
                    2: { bg: "bg-purple-500/20", text: "text-purple-500" },
                    3: { bg: "bg-pink-500/20", text: "text-pink-500" },
                    4: { bg: "bg-green-500/20", text: "text-green-500" },
                  }

                  const phaseColor = phaseColors[phase as keyof typeof phaseColors] || phaseColors[1]

                  // Check if previous phase is completed to unlock this phase
                  const prevPhase = phase - 1
                  const prevPhaseModules = modulesByPhase[prevPhase] || []
                  const isPrevPhaseCompleted =
                    prevPhase < 1 || prevPhaseModules.every((m) => completedModules.includes(m.slug))

                  return (
                    <div key={phase}>
                      <div className="flex items-center gap-2 mb-6">
                        <div className={`h-8 w-8 rounded-full ${phaseColor.bg} flex items-center justify-center`}>
                          <span className={`${phaseColor.text} font-medium`}>{phase}</span>
                        </div>
                        <h2 className="text-2xl font-bold">
                          {phase === 1 && "Foundational Concepts"}
                          {phase === 2 && "Core Interactive Modules"}
                          {phase === 3 && "Advanced Concepts"}
                          {phase === 4 && "Ethics and Advanced Reasoning"}
                        </h2>
                      </div>

                      <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                        <div className="space-y-6">
                          {phaseModules.map((module, index) => {
                            const isCompleted = completedModules.includes(module.slug)
                            const isAvailable =
                              isPrevPhaseCompleted &&
                              (index === 0 || completedModules.includes(phaseModules[index - 1].slug))

                            return (
                              <motion.div
                                key={module.slug}
                                className={`relative pl-12 ${!isAvailable ? "opacity-60" : ""}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isAvailable ? 1 : 0.6, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              >
                                <div className="absolute left-4 top-1 -ml-[9px]">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : isAvailable ? (
                                    <Circle className="h-5 w-5 text-blue-500" />
                                  ) : (
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>

                                <div
                                  className={`bg-card border rounded-xl p-6 shadow-sm ${isCompleted ? "border-green-500/30" : ""}`}
                                >
                                  <div className="flex justify-between items-start mb-4">
                                    <div>
                                      <h3 className="text-xl font-bold">{module.title}</h3>
                                      <p className="text-muted-foreground">{module.description}</p>
                                    </div>
                                    {isCompleted && (
                                      <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">
                                        Completed
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                      <span className="font-medium">Interaction:</span> {module.interaction}
                                    </div>
                                    <Button
                                      variant={isCompleted ? "outline" : "default"}
                                      disabled={!isAvailable}
                                      onClick={() => goToModule(module.slug)}
                                    >
                                      {isCompleted ? "Review" : isAvailable ? "Start" : "Locked"}
                                      {isAvailable && !isCompleted && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

