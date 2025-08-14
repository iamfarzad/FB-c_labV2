export type QuizOption = { key: string; label: string }
export type QuizQuestion = { id: string; prompt: string; options: QuizOption[]; correctKey: string }

export const MODULE_QUIZZES: Record<string, QuizQuestion[]> = {
  'ai-hierarchy-visual': [
    {
      id: 'q1',
      prompt: 'Which is the correct hierarchy from broadest to most specific?',
      options: [
        { key: 'a', label: 'LLMs → Generative AI → Machine Learning → AI' },
        { key: 'b', label: 'AI → Machine Learning → Generative AI → LLMs' },
        { key: 'c', label: 'Machine Learning → AI → Generative AI → LLMs' },
      ],
      correctKey: 'b',
    },
  ],
  'tokenization-visualizer': [
    {
      id: 'q1',
      prompt: 'What is a token in the context of LLMs?',
      options: [
        { key: 'a', label: 'A unit of currency' },
        { key: 'b', label: 'A piece of text (word, subword, or character)' },
        { key: 'c', label: 'A GPU memory page' },
      ],
      correctKey: 'b',
    },
  ],
  'llm-parameter-growth': [
    {
      id: 'q1',
      prompt: 'Increasing parameters generally increases…',
      options: [
        { key: 'a', label: 'Model capacity and training cost' },
        { key: 'b', label: 'Inference speed only' },
        { key: 'c', label: 'Disk I/O only' },
      ],
      correctKey: 'a',
    },
  ],
  'attention-mechanism-demo': [
    {
      id: 'q1',
      prompt: 'Self‑attention lets the model…',
      options: [
        { key: 'a', label: 'Ignore previous tokens' },
        { key: 'b', label: 'Focus on relevant tokens to compute context' },
        { key: 'c', label: 'Only look at future tokens' },
      ],
      correctKey: 'b',
    },
  ],
  'embedding-explorer': [
    {
      id: 'q1',
      prompt: 'Embeddings place similar meanings…',
      options: [
        { key: 'a', label: 'Close together in vector space' },
        { key: 'b', label: 'Randomly' },
        { key: 'c', label: 'Only along the x‑axis' },
      ],
      correctKey: 'a',
    },
  ],
  'temperature-sampling-controls': [
    {
      id: 'q1',
      prompt: 'Higher temperature typically makes outputs…',
      options: [
        { key: 'a', label: 'More deterministic' },
        { key: 'b', label: 'More random/creative' },
        { key: 'c', label: 'Faster' },
      ],
      correctKey: 'b',
    },
  ],
  'customization-modes': [
    {
      id: 'q1',
      prompt: 'Choose the lightest way to tailor behavior first:',
      options: [
        { key: 'a', label: 'Fine‑tuning' },
        { key: 'b', label: 'RAG' },
        { key: 'c', label: 'Prompt engineering' },
      ],
      correctKey: 'c',
    },
  ],
  'prompt-engineering-sandbox': [
    {
      id: 'q1',
      prompt: 'A good prompt typically includes…',
      options: [
        { key: 'a', label: 'Vague goals' },
        { key: 'b', label: 'Specific task, constraints, examples' },
        { key: 'c', label: 'Only emojis' },
      ],
      correctKey: 'b',
    },
  ],
  'cost-speed-chart': [
    {
      id: 'q1',
      prompt: 'Selecting a model is about balancing…',
      options: [
        { key: 'a', label: 'Latency, cost, and quality' },
        { key: 'b', label: 'Only parameters' },
        { key: 'c', label: 'Only speed' },
      ],
      correctKey: 'a',
    },
  ],
  'hallucination-checker': [
    {
      id: 'q1',
      prompt: 'To reduce hallucinations you should…',
      options: [
        { key: 'a', label: 'Ground with retrieval and cite sources' },
        { key: 'b', label: 'Use higher temperature' },
        { key: 'c', label: 'Avoid any constraints' },
      ],
      correctKey: 'a',
    },
  ],
  'bias-explorer': [
    {
      id: 'q1',
      prompt: 'Bias mitigation strategies include…',
      options: [
        { key: 'a', label: 'Fair sampling and evaluation' },
        { key: 'b', label: 'Ignoring metrics' },
        { key: 'c', label: 'Only use larger models' },
      ],
      correctKey: 'a',
    },
  ],
  'reasoning-visualizer': [
    {
      id: 'q1',
      prompt: 'Chain‑of‑thought / decomposition helps by…',
      options: [
        { key: 'a', label: 'Splitting problems into steps' },
        { key: 'b', label: 'Hiding intermediate steps' },
        { key: 'c', label: 'Only using embeddings' },
      ],
      correctKey: 'a',
    },
  ],
}

export function hasQuizFor(slug: string): boolean {
  return Array.isArray(MODULE_QUIZZES[slug]) && MODULE_QUIZZES[slug].length > 0
}


