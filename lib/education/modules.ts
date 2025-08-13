export interface ModuleItem {
  id: number
  title: string
  slug: string
  description: string
  phase: number
  interaction: string
  goal: string
  featured: boolean
}

const MODULES: ModuleItem[] = [
  {
    id: 1,
    title: 'AI Hierarchy Visual',
    slug: 'ai-hierarchy-visual',
    description: 'Relationship between AI, ML, Generative AI, and LLMs.',
    phase: 1,
    interaction: 'Interactive layered rings',
    goal: 'Understand taxonomy and scope',
    featured: true,
  },
  {
    id: 2,
    title: 'Tokenization Visualizer',
    slug: 'tokenization-visualizer',
    description: 'See how text splits into tokens and fills a context window.',
    phase: 1,
    interaction: 'Token chips with counts',
    goal: 'Understand tokens and context windows',
    featured: true,
  },
  {
    id: 3,
    title: 'LLM Parameter Growth',
    slug: 'llm-parameter-growth',
    description: 'Scaling trends and neural architecture preview.',
    phase: 1,
    interaction: 'Animated bars + architecture canvas',
    goal: 'See size/performance tradeoffs',
    featured: false,
  },
  {
    id: 4,
    title: 'Attention Mechanism Demo',
    slug: 'attention-mechanism-demo',
    description: 'How models focus on context to resolve meaning.',
    phase: 2,
    interaction: 'Highlight words and visualize attention',
    goal: 'Grasp attention and context resolution',
    featured: true,
  },
  {
    id: 5,
    title: 'Embedding Explorer',
    slug: 'embedding-explorer',
    description: 'Vectors, similarity, and relationships.',
    phase: 2,
    interaction: 'Canvas plot with relationships',
    goal: 'Build intuition for embeddings',
    featured: true,
  },
  {
    id: 6,
    title: 'Temperature & Sampling',
    slug: 'temperature-sampling-controls',
    description: 'Explore temperature, top‑p, and top‑k effects on output.',
    phase: 2,
    interaction: 'Sliders and sample outputs',
    goal: 'Balance creativity vs reliability',
    featured: false,
  },
  {
    id: 7,
    title: 'Customization Modes',
    slug: 'customization-modes',
    description: 'Prompting vs RAG vs Fine-tuning.',
    phase: 3,
    interaction: 'Tabbed explainer with inputs',
    goal: 'Choose the right customization path',
    featured: false,
  },
  {
    id: 8,
    title: 'Prompt Engineering Sandbox',
    slug: 'prompt-engineering-sandbox',
    description: 'Try zero/few‑shot, CoT, and role prompting.',
    phase: 3,
    interaction: 'Tabs with prompt/response',
    goal: 'Apply prompting patterns effectively',
    featured: false,
  },
  {
    id: 9,
    title: 'LLM Cost & Speed',
    slug: 'cost-speed-chart',
    description: 'Compare models by cost, speed, and parameters.',
    phase: 3,
    interaction: 'Controls + table view',
    goal: 'Trade off latency, cost, and quality',
    featured: false,
  },
  {
    id: 10,
    title: 'Hallucination Checker',
    slug: 'hallucination-checker',
    description: 'Identify and mitigate hallucinations.',
    phase: 4,
    interaction: 'Examples + custom analyzer (simulated)',
    goal: 'Recognize and reduce hallucinations',
    featured: false,
  },
  {
    id: 11,
    title: 'Bias & Ethics Explorer',
    slug: 'bias-explorer',
    description: 'Understand bias types and mitigation strategies.',
    phase: 4,
    interaction: 'Tabs + analysis + mitigation',
    goal: 'Design for fairness and safety',
    featured: false,
  },
  {
    id: 12,
    title: 'Reasoning Visualizer',
    slug: 'reasoning-visualizer',
    description: 'Step through multi‑step reasoning process.',
    phase: 4,
    interaction: 'Play/Pause/Reset with step highlights',
    goal: 'See reasoning decomposition',
    featured: false,
  },
]

export function getAllModules(): ModuleItem[] {
  return MODULES
}

export function getModuleBySlug(slug: string): ModuleItem | undefined {
  return MODULES.find(m => m.slug === slug)
}

export function getAllModuleSlugs(): string[] {
  return MODULES.map(m => m.slug)
}


