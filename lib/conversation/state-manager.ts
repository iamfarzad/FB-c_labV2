export type Stage = 'GREETING' | 'INTENT' | 'QUALIFY' | 'ACTION'

export function nextStage(current: Stage, hasIntent: boolean, hasContext: boolean): Stage {
  if (!hasContext) return 'GREETING'
  if (current === 'GREETING' && hasIntent) return 'INTENT'
  if (current === 'INTENT') return 'QUALIFY'
  if (current === 'QUALIFY') return 'ACTION'
  return current
}


