"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { cn } from "@/lib/utils"
import type { WorkshopModule, WorkshopStep } from "./education-modules"
import { QuizQuestion } from "./education-modules"
import { useToast } from "@/hooks/use-toast"

type Props = {
  module: WorkshopModule
  sessionId?: string | null
  className?: string
  onAskAI?: (payload: { moduleId: string; stepId?: string }) => void
}

type Stored = {
  completed: Array<{ moduleId: string; stepId: string }>
  xp: number
  badges: string[]
}

const STORAGE_KEY = "fbc_education_progress_v1"

function load(): Stored {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completed: [], xp: 0, badges: [] }
    return JSON.parse(raw) as Stored
  } catch {
    return { completed: [], xp: 0, badges: [] }
  }
}

function save(data: Stored) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

export function GamifiedSection({ module, sessionId, className, onAskAI }: Props) {
  const [state, setState] = useState<Stored>({ completed: [], xp: 0, badges: [] })
  const { toast } = useToast()
  const [sid, setSid] = useState<string | null>(null)

  useEffect(() => { setState(load()) }, [])
  useEffect(() => {
    try {
      const m = document.cookie.match(/(?:^|; )demo-session-id=([^;]+)/)
      if (m && m[1]) setSid(decodeURIComponent(m[1]))
      // Prefer shared intelligence-session-id when available
      const ls = window.localStorage.getItem('intelligence-session-id')
      if (ls) setSid(ls)
    } catch {}
  }, [])

  const completedIds = useMemo(() => new Set(state.completed.filter(x => x.moduleId === module.id).map(x => x.stepId)), [state.completed, module.id])
  const moduleXp = useMemo(() => module.steps.filter(s => completedIds.has(s.id)).reduce((sum, s) => sum + s.xp, 0), [module.steps, completedIds])

  const markDone = useCallback(async (step: WorkshopStep) => {
    if (completedIds.has(step.id)) return
    const next: Stored = {
      completed: [...state.completed, { moduleId: module.id, stepId: step.id }],
      xp: state.xp + step.xp,
      badges: state.badges.includes(module.badge || '') || !module.badge || completedIds.size + 1 < module.steps.length
        ? state.badges
        : [...state.badges, module.badge],
    }
    setState(next)
    save(next)
    try {
      // notify server context for AI suggestions
      await fetch('/api/intelligence/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-intelligence-session-id': (sessionId || sid || '') },
        body: JSON.stringify({ 
          moduleId: module.id, 
          stepId: step.id, 
          xp: step.xp,
          moduleTitle: module.title,
          stepTitle: step.title,
          note: `Completed: ${module.title} — ${step.title} (+${step.xp} XP)`
        }),
      })
    } catch {}
    try { window.dispatchEvent(new CustomEvent('chat-capability-used')) } catch {}
    toast({ title: 'Progress saved', description: `${step.title} (+${step.xp} XP)` })
    // If this was a quiz, auto-open chat with a context card
    if (step.kind === 'quiz') {
      try {
        const contextText = `Education context:\n- Module: ${module.title}\n- Step: ${step.title}\n- Earned: +${step.xp} XP\n\nAsk for: next best practical exercise or tailored ROI scenario.`
        window.localStorage.setItem('fbc:education:last', contextText)
        window.location.href = '/chat?education=1'
      } catch {}
    }
  }, [completedIds, module.id, module.badge, module.steps.length, sessionId, state.badges, state.completed, state.xp])

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({})
  const onAnswer = (q: QuizQuestion, idx: number) => {
    setQuizAnswers(prev => ({ ...prev, [q.id]: idx }))
    const correct = idx === q.correctIndex
    toast({
      title: correct ? 'Correct' : 'Not quite',
      description: correct ? (q.feedbackCorrect || 'Nice!') : (q.feedbackIncorrect || 'Take another look.'),
    })
  }

  return (
    <Card className={cn("neu-card", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <CardDescription>{module.summary}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {module.steps.length > 0 && completedIds.size >= module.steps.length && (
              <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[11px] text-green-600">Completed</div>
            )}
            <ProgressTracker />
            <div className="rounded-full border border-border/40 px-2 py-1 text-xs text-muted-foreground">XP {moduleXp}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Badge shelf */}
        {state.badges.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {state.badges.map((b) => (
              <span key={b} className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-[11px]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> {b}
              </span>
            ))}
          </div>
        )}
        <ol className="space-y-3">
          {module.steps.map(step => {
            const done = completedIds.has(step.id)
            return (
              <li key={step.id} className={cn("flex items-center justify-between gap-3 rounded-lg border p-3", done ? "bg-accent/10 border-accent/30" : "bg-card/60") }>
                <div>
                  <div className="font-medium">{step.title}</div>
                  {step.description && <div className="text-sm text-muted-foreground">{step.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">+{step.xp} XP</div>
                  {step.kind === 'quiz' && step.quiz && step.quiz.length ? (
                    <Button size="sm" variant={done ? 'outline' : 'default'} onClick={() => markDone(step)}>
                      {done ? 'Completed' : 'Complete quiz'}
                    </Button>
                  ) : (
                    !done ? (
                      <Button size="sm" onClick={() => markDone(step)}>Mark done</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => onAskAI?.({ moduleId: module.id, stepId: step.id })}>Ask AI</Button>
                    )
                  )}
                </div>
              </li>
            )
          })}
        </ol>
        {module.steps.some(s => s.kind === 'quiz' && s.quiz?.length) && (
          <div className="mt-4 space-y-4">
            {module.steps.filter(s => s.kind === 'quiz' && s.quiz?.length).map(s => (
              <div key={s.id} className="rounded-lg border p-4">
                <div className="font-medium mb-2">{s.title}</div>
                {s.quiz!.map(q => (
                  <div key={q.id} className="mb-3">
                    <div className="text-sm mb-2">{q.prompt}</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, i) => (
                        <Button key={i} variant={(quizAnswers[q.id] === i) ? 'secondary' : 'outline'} size="sm" onClick={() => onAnswer(q, i)}>
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GamifiedSection


