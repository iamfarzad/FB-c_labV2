const keys = new Set<string>()

export function seen(key: string): boolean {
  if (keys.has(key)) return true
  keys.add(key)
  return false
}


