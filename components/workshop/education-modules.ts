export type WorkshopStepKind = 'read' | 'interact' | 'quiz'

export interface QuizQuestion {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  feedbackCorrect?: string
  feedbackIncorrect?: string
}

export interface WorkshopStep {
  id: string
  title: string
  description?: string
  xp: number
  kind: WorkshopStepKind
  quiz?: QuizQuestion[]
}

export interface WorkshopModule {
  id: string
  title: string
  summary: string
  steps: WorkshopStep[]
  badge?: string
}

export const WORKSHOP_MODULES: WorkshopModule[] = [
  {
    id: 'industrial-evolution',
    title: 'Industrial Evolution',
    summary: 'From mechanization to human-centered intelligence and collaboration with AI.',
    steps: [
      { id: 'timeline', title: 'Explore the timeline', xp: 20, kind: 'interact', description: 'Scroll and explore eras 1.0 → 5.0' },
      { id: 'compare', title: 'Compare eras', xp: 10, kind: 'read', description: 'Key features across each industrial era' },
      { id: 'quiz', title: 'Quick check: eras', xp: 15, kind: 'quiz', quiz: [
        { id: 'q1', prompt: 'Industry 4.0 is primarily about…', options: ['Steam power', 'Mass production', 'Connectivity & Intelligence', 'Human-centered collaboration'], correctIndex: 2, feedbackCorrect: 'Yes—cyber-physical systems and smart connectivity.', feedbackIncorrect: 'Industry 4.0 focuses on connectivity and intelligence.' },
        { id: 'q2', prompt: 'Industry 5.0 emphasizes…', options: ['Maximizing automation', 'Human-centered collaboration with AI', 'Just-in-time manufacturing', 'Coal power'], correctIndex: 1, feedbackCorrect: 'Correct—human + machine collaboration.', feedbackIncorrect: 'Industry 5.0 is about human-centered collaboration.' },
      ]},
    ],
    badge: 'evolution',
  },
  {
    id: 'future-skills',
    title: 'Future Skills',
    summary: 'Core business competencies and analytical skills for modern teams.',
    steps: [
      { id: 'competencies', title: 'Review competencies', xp: 15, kind: 'read' },
      { id: 'apply', title: 'Identify your gaps', xp: 15, kind: 'interact' },
    ],
    badge: 'skills',
  },
  {
    id: 'roles-evolving',
    title: 'Evolving Roles',
    summary: 'How team and leadership responsibilities are transforming.',
    steps: [
      { id: 'team-roles', title: 'Team member transitions', xp: 10, kind: 'read' },
      { id: 'leadership', title: 'Leadership transitions', xp: 10, kind: 'read' },
    ],
    badge: 'roles',
  },
  {
    id: 'ai-integration',
    title: 'AI Integration',
    summary: 'Practical patterns for applying AI with business value.',
    steps: [
      { id: 'examples', title: 'Explore business examples', xp: 15, kind: 'read' },
      { id: 'roi', title: 'Estimate ROI', xp: 25, kind: 'interact', description: 'Use the ROI calculator with a real scenario' },
      { id: 'quiz', title: 'Quick check: value', xp: 15, kind: 'quiz', quiz: [
        { id: 'q1', prompt: 'Best first step for AI adoption?', options: ['Full platform migration', 'Pilot on a narrow workflow', 'Buy every tool', 'Skip data quality'], correctIndex: 1, feedbackCorrect: 'Right—pilot to validate value and risk.', feedbackIncorrect: 'Start with a small pilot to validate value.' },
        { id: 'q2', prompt: 'ROI is improved by…', options: ['Higher compute only', 'Better prompts only', 'Reducing hours/costs or increasing revenue', 'Larger models only'], correctIndex: 2, feedbackCorrect: 'Exactly—time/cost savings or revenue lift.', feedbackIncorrect: 'ROI relates to time/cost savings or revenue lift.' },
        { id: 'q3', prompt: 'A practical metric to track is…', options: ['Lines of code', 'Model parameter count', 'Hours saved per week', 'Number of dashboards'], correctIndex: 2, feedbackCorrect: 'Yes—business-outcome metrics like hours saved.', feedbackIncorrect: 'Focus on business outcomes like hours saved.' },
      ]},
    ],
    badge: 'ai',
  },
  {
    id: 'local-llm',
    title: 'Local LLM Platforms',
    summary: 'Run models locally: pros, cons, and when to use them.',
    steps: [
      { id: 'platforms', title: 'Review platforms', xp: 10, kind: 'read' },
      { id: 'pick', title: 'Pick a platform to try', xp: 15, kind: 'interact' },
    ],
    badge: 'llm',
  },
]


