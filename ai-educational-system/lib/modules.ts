export interface Module {
  id: number
  title: string
  slug: string
  description: string
  phase: number
  interaction: string
  goal: string
  featured: boolean
}

const modules: Module[] = [
  // Phase 1: Foundational Modules
  {
    id: 1,
    title: "AI Hierarchy Visual",
    slug: "ai-hierarchy-visual",
    description: "Understand the relationship between AI, ML, GenAI, and LLMs",
    phase: 1,
    interaction: "Click/hover concentric layers",
    goal: "Understand nested relationships in AI technologies",
    featured: true,
  },
  {
    id: 2,
    title: "LLM Parameter Growth",
    slug: "llm-parameter-growth",
    description: "Visualize how LLMs have grown in size over time",
    phase: 1,
    interaction: "Timeline slider with animated visualization",
    goal: "Understand scale, cost, and evolution of models",
    featured: true,
  },

  // Phase 2: Core Interactive Modules
  {
    id: 3,
    title: "Tokenization Visualizer",
    slug: "tokenization-visualizer",
    description: "See how text is broken into tokens by LLMs",
    phase: 2,
    interaction: "Input box + token breakdown",
    goal: "Understand token limits and costs",
    featured: true,
  },
  {
    id: 4,
    title: "Attention Mechanism Demo",
    slug: "attention-mechanism-demo",
    description: "Visualize how attention works in transformer models",
    phase: 2,
    interaction: "Sentence viewer with dynamic arrows",
    goal: "Understand contextual reasoning in LLMs",
    featured: true,
  },
  {
    id: 5,
    title: "Embedding Explorer",
    slug: "embedding-explorer",
    description: "2D plot of semantic relationships between words and concepts",
    phase: 2,
    interaction: "Interactive vector space visualization",
    goal: "Understand vector representations and semantic similarity",
    featured: false,
  },
  {
    id: 6,
    title: "Prompt Engineering Sandbox",
    slug: "prompt-engineering-sandbox",
    description: "Test different prompting techniques and strategies",
    phase: 2,
    interaction: "Input + output window with examples",
    goal: "Learn effective prompt design strategies",
    featured: false,
  },

  // Phase 3: Advanced Concepts
  {
    id: 7,
    title: "Temperature & Sampling Controls",
    slug: "temperature-sampling-controls",
    description: "Adjust parameters to see how they affect model outputs",
    phase: 3,
    interaction: "Sliders for temperature/top-k/top-p",
    goal: "Understand sampling randomness and creativity controls",
    featured: false,
  },
  {
    id: 8,
    title: "Fine-Tuning vs. Prompting vs. RAG",
    slug: "customization-modes",
    description: "Compare different approaches to customizing LLM behavior",
    phase: 3,
    interaction: "Tabs to simulate each method",
    goal: "Understand benefits, risks, and costs of each approach",
    featured: false,
  },
  {
    id: 9,
    title: "LLM Cost & Speed Comparison",
    slug: "cost-speed-chart",
    description: "Visualize the tradeoffs between model size, speed, and cost",
    phase: 3,
    interaction: "Interactive chart with adjustable parameters",
    goal: "Make informed decisions about model selection",
    featured: false,
  },
  {
    id: 10,
    title: "Hallucination Detector",
    slug: "hallucination-checker",
    description: "Learn to identify and mitigate AI hallucinations",
    phase: 3,
    interaction: "Compare real vs. fake outputs",
    goal: "Understand hallucination risks and mitigation strategies",
    featured: false,
  },

  // Phase 4: Ethics and Advanced Reasoning
  {
    id: 11,
    title: "Bias & Ethics Explorer",
    slug: "bias-explorer",
    description: "Examine how biases manifest in AI systems",
    phase: 4,
    interaction: "Prompts revealing biased completions",
    goal: "Understand ethical considerations in AI development",
    featured: false,
  },
  {
    id: 12,
    title: "Chain-of-Thought Reasoning Viewer",
    slug: "reasoning-visualizer",
    description: "Visualize how LLMs solve complex reasoning tasks",
    phase: 4,
    interaction: "Step-by-step token output for reasoning tasks",
    goal: 'Understand how LLMs "think" through problems',
    featured: false,
  },
]

export function getAllModules(): Module[] {
  return modules
}

export function getAllModuleSlugs(): string[] {
  return modules.map((module) => module.slug)
}

export function getModuleBySlug(slug: string): Module | undefined {
  return modules.find((module) => module.slug === slug)
}

