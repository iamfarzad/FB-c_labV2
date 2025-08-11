export const STAGES = ['GREETING', 'INTENT', 'QUALIFY', 'ACTION'] as const
export type Stage = typeof STAGES[number]


