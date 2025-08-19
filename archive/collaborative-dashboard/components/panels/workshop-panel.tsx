"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, Users, Clock, CheckCircle, BarChart3, Play, SkipForward, Trophy, Star, Brain, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface WorkshopPanelProps {
  mode?: 'card' | 'fullscreen'
  onClose?: () => void
  onCancel?: () => void
  onAskAI?: (payload: { moduleId: string; stepId?: string }) => void
  sessionId?: string | null
}

interface WorkshopStep {
  id: string
  title: string
  description?: string
  xp: number
  kind: 'lesson' | 'quiz' | 'exercise'
  quiz?: QuizQuestion[]
}

interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  feedbackCorrect?: string
  feedbackIncorrect?: string
}

interface WorkshopModule {
  id: string
  title: string
  summary: string
  badge?: string
  steps: WorkshopStep[]
}

type Stored = {
  completed: Array<{ moduleId: string; stepId: string }>
  xp: number
  badges: string[]
}

const STORAGE_KEY = "fbc_workshop_progress_v1"

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

export function WorkshopPanel({
  mode = 'card',
  onClose,
  onCancel,
  onAskAI,
  sessionId
}: WorkshopPanelProps) {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState<"dashboard" | "quiz" | "poll" | "results" | "modules">("dashboard")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [quizActive, setQuizActive] = useState(false)
  const [state, setState] = useState<Stored>({ completed: [], xp: 0, badges: [] })
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({})
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

  const participants = [
    { id: 1, name: "Alex Chen", score: 85, progress: 80, xp: 1250 },
    { id: 2, name: "Sarah Kim", score: 92, progress: 100, xp: 1580 },
    { id: 3, name: "Mike Johnson", score: 78, progress: 60, xp: 980 },
    { id: 4, name: "Emma Davis", score: 88, progress: 90, xp: 1340 },
  ]

  const sampleModule: WorkshopModule = {
    id: "react-fundamentals",
    title: "React Fundamentals",
    summary: "Master the core concepts of React development",
    badge: "React Expert",
    steps: [
      {
        id: "hooks-intro",
        title: "Introduction to React Hooks",
        description: "Learn the basics of useState and useEffect",
        xp: 100,
        kind: "lesson"
      },
      {
        id: "hooks-quiz",
        title: "Hooks Knowledge Check",
        description: "Test your understanding of React hooks",
        xp: 150,
        kind: "quiz",
        quiz: [
          {
            id: "q1",
            prompt: "What is the primary benefit of using React hooks?",
            options: ["Better performance", "Simpler state management", "Smaller bundle size", "Faster rendering"],
            correctIndex: 1,
            feedbackCorrect: "Correct! Hooks simplify state management in functional components.",
            feedbackIncorrect: "Not quite. Think about how hooks help manage component state."
          },
          {
            id: "q2",
            prompt: "Which hook is used for side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            correctIndex: 1,
            feedbackCorrect: "Exactly! useEffect handles side effects like API calls and subscriptions.",
            feedbackIncorrect: "Try again. Consider which hook handles things like API calls."
          }
        ]
      },
      {
        id: "practical-exercise",
        title: "Build a Counter Component",
        description: "Create a functional counter using hooks",
        xp: 200,
        kind: "exercise"
      }
    ]
  }

  const completedIds = useMemo(() => new Set(state.completed.filter(x => x.moduleId === sampleModule.id).map(x => x.stepId)), [state.completed, sampleModule.id])
  const moduleXp = useMemo(() => sampleModule.steps.filter(s => completedIds.has(s.id)).reduce((sum, s) => sum + s.xp, 0), [sampleModule.steps, completedIds])

  const markDone = useCallback(async (step: WorkshopStep) => {
    if (completedIds.has(step.id)) return
    const next: Stored = {
      completed: [...state.completed, { moduleId: sampleModule.id, stepId: step.id }],
      xp: state.xp + step.xp,
      badges: state.badges.includes(sampleModule.badge || '') || !sampleModule.badge || completedIds.size + 1 < sampleModule.steps.length
        ? state.badges
        : [...state.badges, sampleModule.badge],
    }
    setState(next)
    save(next)
    try {
      // notify server context for AI suggestions
      await fetch('/api/intelligence/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-intelligence-session-id': (sessionId || sid || '') },
        body: JSON.stringify({ 
          moduleId: sampleModule.id, 
          stepId: step.id, 
          xp: step.xp,
          moduleTitle: sampleModule.title,
          stepTitle: step.title,
          note: `Completed: ${sampleModule.title} — ${step.title} (+${step.xp} XP)`
        }),
      })
    } catch {}
    try { window.dispatchEvent(new CustomEvent('chat-capability-used')) } catch {}
    toast({ title: 'Progress saved', description: `${step.title} (+${step.xp} XP)` })
  }, [completedIds, sampleModule.id, sampleModule.badge, sampleModule.steps.length, sessionId, state.badges, state.completed, state.xp, sid, toast])

  const onAnswer = (q: QuizQuestion, idx: number) => {
    setQuizAnswers(prev => ({ ...prev, [q.id]: idx }))
    const correct = idx === q.correctIndex
    toast({
      title: correct ? 'Correct' : 'Not quite',
      description: correct ? (q.feedbackCorrect || 'Nice!') : (q.feedbackIncorrect || 'Take another look.'),
    })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <div className="text-2xl font-bold text-slate-900">{participants.length}</div>
            <div className="text-sm text-slate-600">Active Participants</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-slate-900">25:30</div>
            <div className="text-sm text-slate-600">Session Time</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-slate-900">{state.xp}</div>
            <div className="text-sm text-slate-600">Total XP</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-slate-900">{state.badges.length}</div>
            <div className="text-sm text-slate-600">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setCurrentView("modules")}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              View Learning Modules
            </Button>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setCurrentView("quiz")
                setQuizActive(true)
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Interactive Quiz
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setCurrentView("poll")}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Create Live Poll
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setCurrentView("results")}>
              <CheckCircle className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participant Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {participants.sort((a, b) => b.xp - a.xp).map((participant, index) => (
              <div key={participant.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-yellow-500 text-white" : 
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-600"
                    )}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{participant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {participant.xp} XP
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {participant.score}%
                    </Badge>
                  </div>
                </div>
                <Progress value={participant.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Badge Display */}
      {state.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {state.badges.map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-700">
                  <Trophy className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderModules = () => (
    <div className="space-y-6">
      <Card className="neu-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{sampleModule.title}</CardTitle>
              <p className="text-slate-600">{sampleModule.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              {completedIds.size >= sampleModule.steps.length && (
                <div className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-[11px] text-green-600">Completed</div>
              )}
              <div className="rounded-full border border-border/40 px-2 py-1 text-xs text-muted-foreground">XP {moduleXp}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {sampleModule.steps.map(step => {
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
                        <Button size="sm" variant="outline" onClick={() => onAskAI?.({ moduleId: sampleModule.id, stepId: step.id })}>
                          <Brain className="w-3 h-3 mr-1" />
                          Ask AI
                        </Button>
                      )
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
          {sampleModule.steps.some(s => s.kind === 'quiz' && s.quiz?.length) && (
            <div className="mt-4 space-y-4">
              {sampleModule.steps.filter(s => s.kind === 'quiz' && s.quiz?.length).map(s => (
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
    </div>
  )

  const renderQuiz = () => {
    const questions = sampleModule.steps.find(s => s.kind === 'quiz')?.quiz || []
    if (!questions.length) return <div>No quiz available</div>
    
    const question = questions[currentQuestion]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            Question {currentQuestion + 1} of {questions.length}
          </Badge>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{question.prompt}</h2>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span>30 seconds</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswer === index ? "default" : "outline"}
                className={`w-full text-left justify-start h-auto p-4 ${
                  selectedAnswer === index ? "bg-emerald-600 hover:bg-emerald-700" : ""
                }`}
                onClick={() => setSelectedAnswer(index)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index ? "border-white bg-white" : "border-slate-300"
                    }`}
                  >
                    {selectedAnswer === index && <div className="w-3 h-3 rounded-full bg-emerald-600"></div>}
                  </div>
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentView("dashboard")}>
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentQuestion === questions.length - 1}
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Next
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" disabled={selectedAnswer === null}>
              Submit Answer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case "modules":
        return renderModules()
      case "quiz":
        return renderQuiz()
      case "poll":
        return (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Live Poll Feature</h3>
            <p className="text-slate-600">Create and manage real-time polls for your workshop participants</p>
          </div>
        )
      case "results":
        return (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Analytics Dashboard</h3>
            <p className="text-slate-600">View detailed performance metrics and learning progress</p>
          </div>
        )
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 p-6">{renderContent()}</div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-slate-200 p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              Workshop Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Status</span>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Duration</span>
              <span className="text-sm font-medium">25:30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Participants</span>
              <span className="text-sm font-medium">{participants.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Your XP</span>
              <span className="text-sm font-medium">{state.xp}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={currentView === "dashboard" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={currentView === "modules" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("modules")}
            >
              Learning Modules
            </Button>
            <Button
              variant={currentView === "quiz" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("quiz")}
            >
              Interactive Quiz
            </Button>
            <Button
              variant={currentView === "poll" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("poll")}
            >
              Live Polls
            </Button>
            <Button
              variant={currentView === "results" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("results")}
            >
              Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Open Canvas
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Start Video Call
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Share Screen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
