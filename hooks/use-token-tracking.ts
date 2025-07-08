"use client"

import { useState, useEffect, useCallback } from "react"

interface TokenAnalytics {
  summary: {
    totalCost: number
    totalTokens: number
    totalRequests: number
    averageCostPerRequest: number
    timeframe: string
    startTime: string
    endTime: string
  }
  breakdown: {
    byProvider: Record<string, { cost: number; usage: number }>
    byModel: Record<string, { cost: number; usage: number; requests: number }>
    byDay: Record<string, number>
  }
  logs: any[]
}

export function useTokenAnalytics() {
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (timeframe = "24h", provider?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ timeframe })
      if (provider && provider !== "all") {
        params.append("provider", provider)
      }

      const response = await fetch(`/api/admin/token-usage?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Token analytics fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const exportData = useCallback(async (timeframe = "24h") => {
    try {
      const params = new URLSearchParams({ timeframe, export: "csv" })
      const response = await fetch(`/api/admin/token-usage?${params}`)

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      const data = await response.json()
      const logs = data.logs || []

      // Create CSV content
      const csvContent = [
        "Date,Provider,Model,Input Tokens,Output Tokens,Total Tokens,Input Cost,Output Cost,Total Cost,Session ID",
        ...logs.map((log: any) =>
          [
            new Date(log.created_at).toISOString(),
            log.provider,
            log.model,
            log.input_tokens,
            log.output_tokens,
            log.total_tokens,
            log.input_cost,
            log.output_cost,
            log.total_cost,
            log.session_id,
          ].join(","),
        ),
      ].join("\n")

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `token-usage-${timeframe}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error("Export error:", err)
      setError(err.message)
    }
  }, [])

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    exportData,
  }
}

export function useTokenTracking(timeframe = "24h", provider?: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ timeframe })
      if (provider) {
        params.append("provider", provider)
      }

      const response = await fetch(`/api/admin/token-usage?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
      console.error("Token tracking error:", err)
    } finally {
      setLoading(false)
    }
  }, [timeframe, provider])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { data, loading, error, refresh }
}
