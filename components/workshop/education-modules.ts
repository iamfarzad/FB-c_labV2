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
    id: 'ai-foundations',
    title: 'Foundations: How LLMs work',
    summary: 'What LLMs are, tokens and context, strengths and limitations.',
    steps: [
      { id: 'what-is-llm', title: 'What is an LLM? (concepts)', xp: 15, kind: 'read' },
      { id: 'tokens-context', title: 'Tokens, context window, costs', xp: 15, kind: 'read' },
      { id: 'limits', title: 'Limitations: hallucinations, recency, privacy', xp: 15, kind: 'read' },
      { id: 'quiz', title: 'Quick check: foundations', xp: 15, kind: 'quiz', quiz: [
        { id: 'q1', prompt: 'Context window refers to…', options: ['File size', 'Max tokens the model can consider', 'RAM usage', 'GPU type'], correctIndex: 1 },
        { id: 'q2', prompt: 'Hallucination is…', options: ['Model speed', 'Fabricated but fluent output', 'Ethical policy', 'Prompt length'], correctIndex: 1 },
      ]},
    ],
    badge: 'foundations',
  },
  {
    id: 'prompting-basics',
    title: 'Prompting Basics',
    summary: 'Instructions, roles, format examples, constraints, step-by-step.',
    steps: [
      { id: 'instructions', title: 'Write clear instructions + constraints', xp: 15, kind: 'interact' },
      { id: 'format', title: 'Add examples and output format', xp: 15, kind: 'read' },
      { id: 'quiz', title: 'Quick check: prompting', xp: 15, kind: 'quiz', quiz: [
        { id: 'q1', prompt: 'Best prompt includes…', options: ['Vague goals', 'Specific task, constraints, examples', 'Only emojis', 'Only system role'], correctIndex: 1 },
        { id: 'q2', prompt: 'To control output structure…', options: ['Ask politely', 'Specify schema/format', 'Use larger model', 'Use shorter prompt'], correctIndex: 1 },
      ]},
    ],
    badge: 'prompting',
  },
  {
    id: 'grounding-retrieval',
    title: 'Grounding & Retrieval (RAG)',
    summary: 'Embeddings, retrieval, citations, and when to ground model outputs.',
    steps: [
      { id: 'embeddings', title: 'What embeddings are used for', xp: 15, kind: 'read' },
      { id: 'rag', title: 'RAG basics and citations', xp: 15, kind: 'read' },
      { id: 'quiz', title: 'Quick check: RAG', xp: 15, kind: 'quiz', quiz: [
        { id: 'q1', prompt: 'RAG helps to…', options: ['Speed up GPUs', 'Ground answers in your data', 'Compress prompts', 'Change model weights'], correctIndex: 1 },
      ]},
    ],
    badge: 'grounding',
  },
  {
    id: 'safety-ethics',
    title: 'Safety & Responsible AI',
    summary: 'Guardrails, privacy, basic policy awareness for production use.',
    steps: [
      { id: 'guardrails', title: 'Guardrails and policy basics', xp: 10, kind: 'read' },
      { id: 'privacy', title: 'Data handling & privacy considerations', xp: 10, kind: 'read' },
    ],
    badge: 'safety',
  },
  {
    id: 'hands-on-lab',
    title: 'Hands-on Lab',
    summary: 'Try tools to apply what you learned.',
    steps: [
      { id: 'chatbot', title: 'Build your first chatbot (open Chat preset)', xp: 20, kind: 'interact', description: 'Use the Chat preset to scaffold a simple bot' },
      { id: 'roi', title: 'Estimate ROI (use the ROI card)', xp: 20, kind: 'interact', description: 'Use the ROI calculator with a real scenario' },
      { id: 'video2app', title: 'Video → App (use launcher)', xp: 20, kind: 'interact', description: 'Paste a YouTube link and generate an app blueprint' },
    ],
    badge: 'lab',
  },
]


