"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Home, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ModuleRenderer from "@/components/module-renderer"
import { getModuleBySlug, getAllModules } from "@/lib/modules"
import { useModuleProgress } from "@/lib/use-module-progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Confetti } from "@/components/ui/confetti"

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug as string
  const { completedModules, completeModule } = useModuleProgress()

  const [module, setModule] = useState(getModuleBySlug(slug))
  const [redirect, setRedirect] = useState(false)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [nextModule, setNextModule] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (!module) {
      setRedirect(true)
      return
    }

    // Check if this module is already completed
    setIsCompleted(completedModules.includes(slug))

    // Find the next module
    const modules = getAllModules()
    const currentIndex = modules.findIndex((m) => m.slug === slug)
    if (currentIndex < modules.length - 1) {
      setNextModule(modules[currentIndex + 1].slug)
    } else {
      setNextModule(null)
    }
  }, [module, slug, completedModules])

  useEffect(() => {
    if (redirect) {
      router.push("/")
    }
  }, [redirect, router])

  const handleCompleteModule = () => {
    if (!isCompleted) {
      setShowConfetti(true)
      completeModule(slug)
      setIsCompleted(true)

      // Delay showing the completion dialog until after confetti animation
      setTimeout(() => {
        setShowCompletionDialog(true)
        setShowConfetti(false)
      }, 1500)
    }
  }

  const goToNextModule = () => {
    if (nextModule) {
      router.push(`/modules/${nextModule}`)
    } else {
      router.push("/")
    }
  }

  if (redirect || !module) {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
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
            <Button
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              onClick={handleCompleteModule}
              disabled={isCompleted}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completed
                </>
              ) : (
                "Mark as Complete"
              )}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-[calc(100vh-4rem)]"
        >
          <ModuleRenderer module={module} />
        </motion.div>
      </div>

      <Confetti isActive={showConfetti} />

      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Module Completed! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Congratulations! You've successfully completed the {module.title} module.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="bg-primary/5 p-4 rounded-lg border mb-4">
              <p className="font-medium text-center mb-2">Achievement Unlocked</p>
              <p className="text-sm text-center text-muted-foreground">{module.title} Master</p>
            </div>

            <p className="mb-2 font-medium">What you've learned:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Understanding of {module.title.toLowerCase()}</li>
              <li>{module.goal}</li>
              <li>Practical experience with {module.interaction.toLowerCase()}</li>
            </ul>
          </div>

          <DialogFooter className="flex justify-center sm:justify-center gap-2">
            {nextModule ? (
              <Button onClick={goToNextModule} className="w-full sm:w-auto">
                Continue to Next Module
              </Button>
            ) : (
              <Button onClick={() => router.push("/")} className="w-full sm:w-auto">
                Return to Journey
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

