const buckets = new Map<string, { count: number; reset: number }>()

export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const item = buckets.get(key)
  if (!item || now > item.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return true
  }
  if (item.count >= max) return false
  item.count++
  return true
}


