// Simple client-side feature flag helper with URL and localStorage overrides
// Usage in client components:
//   import { isFlagEnabled } from '@/lib/flags'
//   if (isFlagEnabled('roi_inline_form')) { ... }

type FlagName = 'roi_inline_form' | 'canvas_console' | 'coach_v2'

const DEFAULT_FLAGS: Record<FlagName, boolean> = {
  roi_inline_form: true,
  canvas_console: true,
  coach_v2: true,
}

const STORAGE_KEY = 'fbc:flags:v1'

let cached: Record<string, boolean> | null = null

function readFromStorage(): Record<string, boolean> {
  try {
    if (typeof window === 'undefined') return {}
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeToStorage(flags: Record<string, boolean>) {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch {}
}

function parseUrlOverrides(): Record<string, boolean> {
  try {
    if (typeof window === 'undefined') return {}
    const qp = new URLSearchParams(window.location.search)
    const raw = qp.get('ff')
    if (!raw) return {}
    const overrides: Record<string, boolean> = {}
    const items = raw.split(',').map(s => s.trim()).filter(Boolean)
    for (const item of items) {
      if (item === 'all') {
        for (const key of Object.keys(DEFAULT_FLAGS)) overrides[key] = true
        continue
      }
      if (item.startsWith('-')) overrides[item.slice(1)] = false
      else overrides[item] = true
    }
    return overrides
  } catch {
    return {}
  }
}

function computeFlags(): Record<string, boolean> {
  const base: Record<string, boolean> = { ...DEFAULT_FLAGS }
  const stored = readFromStorage()
  const url = parseUrlOverrides()
  return { ...base, ...stored, ...url }
}

export function isFlagEnabled(name: FlagName): boolean {
  if (!cached) cached = computeFlags()
  return Boolean(cached[name])
}

export function setFlag(name: FlagName, value: boolean) {
  if (!cached) cached = computeFlags()
  cached[name] = value
  writeToStorage(cached)
}

export function getAllFlags(): Record<string, boolean> {
  if (!cached) cached = computeFlags()
  return { ...cached }
}


