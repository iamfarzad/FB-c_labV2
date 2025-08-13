export const StageInstructions: Record<string, string> = {
  GREETING: 'Welcome and ask for their name naturally.',
  NAME_COLLECTION: 'Acknowledge name; ask for work email to personalize.',
  EMAIL_CAPTURE: 'Thank them; explain you will research the company for context.',
  BACKGROUND_RESEARCH: 'Share brief insights; pivot to challenges.',
  PROBLEM_DISCOVERY: 'Ask specific questions about pain points and KPIs.',
  SOLUTION_PRESENTATION: 'Present tailored options and expected impact.',
  CALL_TO_ACTION: 'Offer a concrete next step (book, summary, or follow-up).',
}

export const STAGES = ['GREETING', 'INTENT', 'QUALIFY', 'ACTION'] as const
export type Stage = typeof STAGES[number]


