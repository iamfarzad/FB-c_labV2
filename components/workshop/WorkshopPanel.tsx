"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Confetti } from "@/components/ui/confetti"
import { getAllModules } from "@/lib/education/modules"
import { useModuleProgress } from "@/hooks/workshop/use-module-progress"
import { BookOpen, Award, TrendingUp, Brain, ChevronRight } from "lucide-react"
import { CourseOutline } from "@/components/workshop/CourseOutline"
import { CitationsDemo } from "@/components/experience/citations-demo"
import ModuleRenderer from "@/components/workshop/ModuleRenderer"
import { getModuleBySlug } from "@/lib/education/modules"
import { MODULE_QUIZZES, hasQuizFor, type QuizQuestion } from "@/lib/education/quizzes"

export function WorkshopPanel() {
  const { completedModules } = useModuleProgress()
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "modules" | "outline" | "lab" | "achievements" | "stats"
  >("dashboard")
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeModuleSlug, setActiveModuleSlug] = useState<string | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const router = useRouter()
  const search = useSearchParams()

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

  const xpForModule = (phase: number) => (phase <= 1 ? 30 : phase === 2 ? 40 : phase === 3 ? 50 : 60)
  const totalXp = augmented.reduce((sum, m) => sum + (m.completed ? xpForModule(m.phase) : 0), 0)

  // URL -> in-panel module view (shallow)
  useEffect(() => {
    const slug = search?.get('module')
    if (slug) {
      setActiveSection('modules')
      setActiveModuleSlug(slug)
      setQuizAnswers({})
      setQuizSubmitted(false)
    }
  }, [search])

  function openModule(slug: string) {
    setActiveSection('modules')
    setActiveModuleSlug(slug)
    setQuizAnswers({})
    setQuizSubmitted(false)
    try { router.replace(`/workshop?module=${slug}`, { scroll: false }) } catch {}
  }

  function closeModule() {
    setActiveModuleSlug(null)
    setQuizAnswers({})
    setQuizSubmitted(false)
    try { router.replace(`/workshop`, { scroll: false }) } catch {}
  }

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

        <div className="grid gap-4 md:grid-cols-4">
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
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-1" />
              <div className="text-sm text-muted-foreground">Total XP</div>
              <div className="text-xl font-semibold">{totalXp}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grounded answers include sources</CardTitle>
          </CardHeader>
          <CardContent>
            <CitationsDemo />
          </CardContent>
        </Card>
      </div>
    )
  }

  function Modules() {
    if (activeModuleSlug) {
      const module = getModuleBySlug(activeModuleSlug)
      if (!module) return <div className="text-muted-foreground">Module not found.</div>
      const questions: QuizQuestion[] = MODULE_QUIZZES[activeModuleSlug] || []
      const allCorrect = questions.length === 0 || questions.every(q => quizAnswers[q.id] === q.correctKey)
      const isCompleted = completedModules.includes(activeModuleSlug)
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{module.title}</h2>
              <div className="text-sm text-muted-foreground">Phase {module.phase}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModule}>Back</Button>
              <Button
                variant={isCompleted ? 'outline' : 'default'}
                disabled={isCompleted || (hasQuizFor(activeModuleSlug) && !allCorrect)}
                onClick={() => {
                  if (hasQuizFor(activeModuleSlug) && !allCorrect) { setQuizSubmitted(true); return }
                  setShowConfetti(true)
                  try {
                    fetch('/api/intelligence/education', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ moduleId: activeModuleSlug, stepId: 'quiz', xp: 30, moduleTitle: module.title })
                    }).catch(() => {})
                  } catch {}
                }}
              >{isCompleted ? 'Completed' : 'Mark as Complete'}</Button>
            </div>
          </div>
          <ModuleRenderer module={module} />
          {hasQuizFor(activeModuleSlug) && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Check</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map(q => (
                    <div key={q.id} className="space-y-3">
                      <div className="text-sm font-medium">{q.prompt}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map(opt => (
                          <Button key={opt.key} variant={quizAnswers[q.id] === opt.key ? 'default' : 'outline'} onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.key }))} className="justify-start">{opt.label}</Button>
                        ))}
                      </div>
                      {quizSubmitted && quizAnswers[q.id] !== q.correctKey && (
                        <div className="text-xs text-red-600">Try again.</div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button onClick={() => setQuizSubmitted(true)}>Check Answers</Button>
                    <Button variant="ghost" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false) }}>Reset</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }
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
                <Button variant={m.completed ? "outline" : "default"} onClick={() => openModule(m.slug)}>
                  {m.completed ? "Review" : "Start"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function Outline() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Course Outline</h2>
        <CourseOutline />
      </div>
    )
  }

  function Lab() {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Hands-on Lab</h2>
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Build your first chatbot (open Chat preset)</div>
              <div className="text-sm text-muted-foreground">Open chat with a learning context</div>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/chat?education=1">Open Chat</Link>
              </Button>
              <Button variant="outline" onClick={() => {
                fetch('/api/intelligence/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: 'lab-chat', stepId: 'open-chat', xp: 20, moduleTitle: 'Hands-on Lab' }) }).catch(() => {})
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 1200)
              }}>Mark done</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Estimate ROI (use the ROI card)</div>
              <div className="text-sm text-muted-foreground">Try the ROI calculator in chat</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/chat?education=1#roi">Open in Chat</Link>
              </Button>
              <Button variant="outline" onClick={() => {
                fetch('/api/intelligence/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: 'lab-roi', stepId: 'roi-card', xp: 20, moduleTitle: 'Hands-on Lab' }) }).catch(() => {})
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 1200)
              }}>Mark done</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Video → App (use launcher)</div>
              <div className="text-sm text-muted-foreground">Paste a YouTube link in chat to generate an app blueprint</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/chat?video=">Launch</Link>
              </Button>
              <Button variant="outline" onClick={() => {
                fetch('/api/intelligence/education', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleId: 'lab-video2app', stepId: 'launcher', xp: 20, moduleTitle: 'Hands-on Lab' }) }).catch(() => {})
                setShowConfetti(true)
                setTimeout(() => setShowConfetti(false), 1200)
              }}>Mark done</Button>
            </div>
          </CardContent>
        </Card>
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
    <div className="h-[100dvh]">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="h-full container mx-auto px-4 py-4">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="min-h-0 overflow-auto lg:sticky lg:top-4 self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workshop</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="grid gap-1">
                <Button variant={activeSection === "dashboard" ? "default" : "ghost"} onClick={() => setActiveSection("dashboard")} className="justify-start">Dashboard</Button>
                <Button variant={activeSection === "modules" ? "default" : "ghost"} onClick={() => setActiveSection("modules")} className="justify-start">Modules</Button>
                  <Button variant={activeSection === "outline" ? "default" : "ghost"} onClick={() => setActiveSection("outline")} className="justify-start">Outline</Button>
                  <Button variant={activeSection === "lab" ? "default" : "ghost"} onClick={() => setActiveSection("lab")} className="justify-start">Lab</Button>
                <Button variant={activeSection === "achievements" ? "default" : "ghost"} onClick={() => setActiveSection("achievements")} className="justify-start">Achievements</Button>
                <Button variant={activeSection === "stats" ? "default" : "ghost"} onClick={() => setActiveSection("stats")} className="justify-start">Stats</Button>
              </nav>
            </CardContent>
          </Card>
          </aside>
          <main className="min-h-0 overflow-auto">
            {activeSection === "dashboard" && <Dashboard />}
            {activeSection === "modules" && <Modules />}
            {activeSection === "outline" && <Outline />}
            {activeSection === "lab" && <Lab />}
            {activeSection === "achievements" && <Achievements />}
            {activeSection === "stats" && <Stats />}
          </main>
        </div>
      </div>
    </div>
  )
}

export default WorkshopPanel


