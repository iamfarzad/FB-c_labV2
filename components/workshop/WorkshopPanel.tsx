"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Confetti } from "@/components/ui/confetti"
import { getAllModules } from "@/lib/education/modules"
import { useModuleProgress } from "@/hooks/workshop/use-module-progress"
import { BookOpen, Award, TrendingUp, Brain, ChevronRight } from "lucide-react"

export function WorkshopPanel() {
  const { completedModules } = useModuleProgress()
  const [activeSection, setActiveSection] = useState<"dashboard" | "modules" | "achievements" | "stats">("dashboard")
  const [showConfetti, setShowConfetti] = useState(false)

  const modules = useMemo(() => getAllModules(), [])
  const augmented = useMemo(() => {
    return modules.map(m => {
      const isCompleted = completedModules.includes(m.slug)
      const estMinutes = Math.max(12, 6 * (m.phase + 1))
      return { ...m, completed: isCompleted, duration: `${estMinutes} min` }
    })
  }, [modules, completedModules])

  const completedCount = augmented.filter(m => m.completed).length
  const progressPct = modules.length ? Math.round((completedCount / modules.length) * 100) : 0
  const nextModule = augmented.find(m => !m.completed)

  function handleCelebrate() {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 1500)
  }

  function Dashboard() {
    return (
      <div className="space-y-6">
        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Your AI Workshop</CardTitle>
              <Badge variant="outline">{completedCount}/{modules.length} complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={progressPct} className="h-2" />
              <div className="text-sm text-muted-foreground">{progressPct}% overall</div>
              <div className="flex gap-2">
                {nextModule ? (
                  <Button asChild>
                    <Link href={`/workshop/modules/${nextModule.slug}`}>
                      Continue: {nextModule.title}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleCelebrate}>Replay modules</Button>
                )}
                <Button variant="outline" onClick={() => setActiveSection("modules")}>View all modules</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-xl font-semibold">{progressPct}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-xl font-semibold">{completedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">Total Modules</div>
              <div className="text-xl font-semibold">{modules.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  function Modules() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Smart Learning Path</h2>
          <Badge variant="outline">{completedCount}/{modules.length} complete</Badge>
        </div>
        {augmented.map(m => (
          <Card key={m.slug} className="transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{m.title}</div>
                    <Badge variant="outline">Phase {m.phase}</Badge>
                    {m.completed && <Badge>Completed</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{m.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">~{m.duration}</div>
                </div>
                <Button asChild variant={m.completed ? "outline" : "default"}>
                  <Link href={`/workshop/modules/${m.slug}`}>
                    {m.completed ? "Review" : "Start"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function Achievements() {
    const milestones = [
      { id: "first", label: "First Module", achieved: completedCount >= 1 },
      { id: "phase2", label: "Phase 2 Unlocked", achieved: augmented.some(m => m.phase >= 2 && m.completed) },
      { id: "all", label: "All Modules", achieved: completedCount === modules.length && modules.length > 0 },
    ]
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map(ms => (
            <Card key={ms.id}>
              <CardContent className="p-4 text-center">
                <Award className={`h-6 w-6 mx-auto mb-1 ${ms.achieved ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-medium">{ms.label}</div>
                <div className="text-xs text-muted-foreground">{ms.achieved ? "Earned" : "Locked"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  function Stats() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Stats</h2>
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Completion</div>
                <div className="text-xl font-semibold">{progressPct}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completed Modules</div>
                <div className="text-xl font-semibold">{completedCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-20 self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workshop</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="grid gap-1">
                <Button variant={activeSection === "dashboard" ? "default" : "ghost"} onClick={() => setActiveSection("dashboard")} className="justify-start">Dashboard</Button>
                <Button variant={activeSection === "modules" ? "default" : "ghost"} onClick={() => setActiveSection("modules")} className="justify-start">Modules</Button>
                <Button variant={activeSection === "achievements" ? "default" : "ghost"} onClick={() => setActiveSection("achievements")} className="justify-start">Achievements</Button>
                <Button variant={activeSection === "stats" ? "default" : "ghost"} onClick={() => setActiveSection("stats")} className="justify-start">Stats</Button>
              </nav>
            </CardContent>
          </Card>
        </aside>
        <main>
          {activeSection === "dashboard" && <Dashboard />}
          {activeSection === "modules" && <Modules />}
          {activeSection === "achievements" && <Achievements />}
          {activeSection === "stats" && <Stats />}
        </main>
      </div>
    </div>
  )
}

export default WorkshopPanel


