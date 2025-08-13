export function makeIdempotencyKey(...parts: Array<string | number | undefined | null>): string {
  const s = parts.filter(Boolean).join('|')
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash) + s.charCodeAt(i)
  return 'idem_' + (hash >>> 0).toString(36)
}
const keys = new Set<string>()

export function seen(key: string): boolean {
  if (keys.has(key)) return true
  keys.add(key)
  return false
}


