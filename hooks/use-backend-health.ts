"use client"

import { useEffect, useState, useCallback } from "react"

export interface BackendHealth {
  apiOk: boolean
  envOk: boolean
  lastChecked: number | null
}

const ping = async (url: string, timeoutMs = 4000): Promise<boolean> => {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(url, { signal: ctrl.signal })
    clearTimeout(t)
    return res.ok
  } catch {
    return false
  }
}

export function useBackendHealth() {
  const [state, setState] = useState<BackendHealth>({ apiOk: true, envOk: true, lastChecked: null })

  const check = useCallback(async () => {
    const [apiOk, envOk] = await Promise.all([
      ping("/api/demo-status"),
      ping("/api/test-env")
    ])
    setState({ apiOk, envOk, lastChecked: Date.now() })
    return { apiOk, envOk }
  }, [])

  useEffect(() => {
    // initial check
    check()
  }, [check])

  return { ...state, check }
}


