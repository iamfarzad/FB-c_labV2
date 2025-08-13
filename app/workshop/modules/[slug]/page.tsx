"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ModuleRenderer from '@/components/workshop/ModuleRenderer'
import { getAllModules, getModuleBySlug } from '@/lib/education/modules'
import { useModuleProgress } from '@/hooks/workshop/use-module-progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Confetti } from '@/components/ui/confetti'

export default function WorkshopModulePage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const module = useMemo(() => getModuleBySlug(slug), [slug])
  const { completedModules, completeModule } = useModuleProgress()

  const [redirect, setRedirect] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [nextModule, setNextModule] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!module) { setRedirect(true); return }
    setIsCompleted(completedModules.includes(slug))
    const modules = getAllModules()
    const idx = modules.findIndex(m => m.slug === slug)
    if (idx >= 0 && idx < modules.length - 1) setNextModule(modules[idx + 1].slug)
    else setNextModule(null)
  }, [module, slug, completedModules])

  useEffect(() => { if (redirect) router.push('/workshop/modules') }, [redirect, router])

  if (!module || redirect) return null

  const handleComplete = () => {
    if (isCompleted) return
    setShowConfetti(true)
    completeModule(slug, { title: module.title, phase: module.phase })
    setIsCompleted(true)
    setTimeout(() => { setShowCompletionDialog(true); setShowConfetti(false) }, 1200)
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/workshop/modules">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to journey</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-medium">{module.title}</h1>
              <p className="text-xs text-muted-foreground">Phase {module.phase}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={isCompleted ? 'outline' : 'default'} size="sm" onClick={handleComplete} disabled={isCompleted}>
              {isCompleted ? (<><CheckCircle className="h-4 w-4 mr-2" />Completed</>) : 'Mark as Complete'}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-16">
        <ModuleRenderer module={module} />
      </div>

      <Confetti isActive={showConfetti} />

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Module Completed! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Great work. You completed {module.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-primary/5 p-4 rounded-lg border mb-4">
              <p className="font-medium text-center mb-2">Achievement Unlocked</p>
              <p className="text-sm text-center text-muted-foreground">{module.title} Master</p>
            </div>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center gap-2">
            {nextModule ? (
              <Button onClick={() => router.push(`/workshop/modules/${nextModule}`)} className="w-full sm:w-auto">Continue to Next Module</Button>
            ) : (
              <Button onClick={() => router.push('/workshop/modules')} className="w-full sm:w-auto">Return to Journey</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


