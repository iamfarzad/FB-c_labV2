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
    {
      id: 'q2',
      prompt: 'LLMs are a subset of…',
      options: [
        { key: 'a', label: 'Generative AI' },
        { key: 'b', label: 'Reinforcement Learning' },
        { key: 'c', label: 'Robotics' },
      ],
      correctKey: 'a',
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
    {
      id: 'q2',
      prompt: 'The context window limits…',
      options: [
        { key: 'a', label: 'How many parameters a model has' },
        { key: 'b', label: 'How many tokens the model considers at once' },
        { key: 'c', label: 'Network latency' },
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
    {
      id: 'q2',
      prompt: 'Chinchilla showed that for a fixed compute budget…',
      options: [
        { key: 'a', label: 'Smaller models trained on more tokens can perform better' },
        { key: 'b', label: 'Only bigger models matter' },
        { key: 'c', label: 'Data has no effect' },
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
    {
      id: 'q2',
      prompt: 'Multi‑head attention helps by…',
      options: [
        { key: 'a', label: 'Looking at different relationships in parallel' },
        { key: 'b', label: 'Reducing tokenization cost' },
        { key: 'c', label: 'Storing weights on disk' },
      ],
      correctKey: 'a',
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
    {
      id: 'q2',
      prompt: 'Cosine similarity compares embeddings by…',
      options: [
        { key: 'a', label: 'Angle between vectors' },
        { key: 'b', label: 'Parameter count' },
        { key: 'c', label: 'Text length' },
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
    {
      id: 'q2',
      prompt: 'Top‑p sampling selects tokens…',
      options: [
        { key: 'a', label: 'From the smallest probability only' },
        { key: 'b', label: 'Until cumulative probability reaches p' },
        { key: 'c', label: 'Alphabetically' },
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
    {
      id: 'q2',
      prompt: 'RAG is preferred when…',
      options: [
        { key: 'a', label: 'You need to inject fresh/private knowledge' },
        { key: 'b', label: 'You only need formatting changes' },
        { key: 'c', label: 'You want fewer tokens' },
      ],
      correctKey: 'a',
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
    {
      id: 'q2',
      prompt: 'Chain‑of‑thought helps when…',
      options: [
        { key: 'a', label: 'You need stepwise reasoning' },
        { key: 'b', label: 'You want more randomness' },
        { key: 'c', label: 'You need faster sampling' },
      ],
      correctKey: 'a',
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
    {
      id: 'q2',
      prompt: 'Smaller models can be better when…',
      options: [
        { key: 'a', label: 'Latency/cost limits dominate' },
        { key: 'b', label: 'You never care about speed' },
        { key: 'c', label: 'Input length is zero' },
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
    {
      id: 'q2',
      prompt: 'Guardrails typically include…',
      options: [
        { key: 'a', label: 'Input validation and policy checks' },
        { key: 'b', label: 'Random token dropping' },
        { key: 'c', label: 'GPU overclocking' },
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
    {
      id: 'q2',
      prompt: 'Evaluation should consider…',
      options: [
        { key: 'a', label: 'Representative test sets' },
        { key: 'b', label: 'Only hand‑picked examples' },
        { key: 'c', label: 'No measurements' },
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
    {
      id: 'q2',
      prompt: 'A failure mode to watch for is…',
      options: [
        { key: 'a', label: 'Hallucinated intermediate steps' },
        { key: 'b', label: 'Lower cosine similarity' },
        { key: 'c', label: 'Too many parameters' },
      ],
      correctKey: 'a',
    },
  ],
}

export function hasQuizFor(slug: string): boolean {
  return Array.isArray(MODULE_QUIZZES[slug]) && MODULE_QUIZZES[slug].length > 0
}


