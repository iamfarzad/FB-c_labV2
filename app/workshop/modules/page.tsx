"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Lock, CheckCircle, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getAllModules } from '@/lib/education/modules'
import { useModuleProgress } from '@/hooks/workshop/use-module-progress'

export default function ModulesPage() {
  const modules = getAllModules()
  const { completedModules } = useModuleProgress()

  const modulesByPhase = modules.reduce((acc, m) => {
    ;(acc[m.phase] ||= []).push(m)
    return acc
  }, {} as Record<number, typeof modules>)

  const phases = Object.keys(modulesByPhase).map(Number).sort((a, b) => a - b)
  const progress = (completedModules.length / modules.length) * 100

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your AI Learning Journey</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{completedModules.length} of {modules.length} completed</span>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      <div className="space-y-12">
        {phases.map((phase) => {
          const phaseModules = modulesByPhase[phase]
          const prevPhase = phase - 1
          const prevModules = modulesByPhase[prevPhase] || []
          const isPrevDone = prevPhase < 1 || prevModules.every(m => completedModules.includes(m.slug))

          return (
            <div key={phase}>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-medium">{phase}</span>
                </div>
                <h2 className="text-2xl font-bold">
                  {phase === 1 && 'Foundational Concepts'}
                  {phase === 2 && 'Core Mechanics & Customization'}
                </h2>
              </div>

              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-6">
                  {phaseModules.map((module, index) => {
                    const isCompleted = completedModules.includes(module.slug)
                    const isAvailable = isPrevDone && (index === 0 || completedModules.includes(phaseModules[index - 1].slug))
                    return (
                      <motion.div key={module.slug} className={`relative pl-12 ${!isAvailable ? 'opacity-60' : ''}`}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: isAvailable ? 1 : 0.6, y: 0 }} transition={{ duration: 0.4 }}>
                        <div className="absolute left-4 top-1 -ml-[9px]">
                          {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500" /> : isAvailable ? <Circle className="h-5 w-5 text-blue-500" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div className={`bg-card border rounded-xl p-6 shadow-sm ${isCompleted ? 'border-green-500/30' : ''}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold">{module.title}</h3>
                              <p className="text-muted-foreground">{module.description}</p>
                            </div>
                            {isCompleted && <div className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">Completed</div>}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm"><span className="font-medium">Interaction:</span> {module.interaction}</div>
                            <Link href={`/workshop/modules/${module.slug}`} className="inline-flex">
                              <Button variant={isCompleted ? 'outline' : 'default'} disabled={!isAvailable}>
                                {isCompleted ? 'Review' : isAvailable ? 'Start' : 'Locked'}
                                {isAvailable && !isCompleted && <ArrowRight className="ml-2 h-4 w-4" />}
                              </Button>
                            </Link>
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
  )
}


