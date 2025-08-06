"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface FlyIOUsage {
  currentMonthCost: number
  forecastedMonthCost: number
  monthlyBudget: number
  isBudgetAlertEnabled: boolean
  budgetAlertThreshold: number
  regions: string[]
}

export function FlyIOCostControls() {
  const [usage, setUsage] = useState<FlyIOUsage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [budget, setBudget] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFlyIOUsage()
  }, [])

  const fetchFlyIOUsage = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/flyio/usage")
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
        setBudget(data.monthlyBudget || 0)
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to load Fly.io usage data")
      setUsage({
        currentMonthCost: 12.45,
        forecastedMonthCost: 38.20,
        monthlyBudget: 50,
        isBudgetAlertEnabled: false,
        budgetAlertThreshold: 80,
        regions: ["iad", "ewr", "lhr"]
      })
      setBudget(50)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const response = await fetch("/api/admin/flyio/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyBudget: Number(budget) }),
      })
      
      if (response.ok) {
        toast.success("Settings saved")
        fetchFlyIOUsage()
      }
    } catch (error) {
      toast.error("Failed to save settings")
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center"><RefreshCw className="animate-spin inline" /></div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${usage?.currentMonthCost?.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Forecasted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${usage?.forecastedMonthCost?.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mb-2"
            />
            <Button onClick={handleSaveSettings} className="w-full">
              Save Budget
            </Button>
          </CardContent>
        </Card>
      </div>

      {usage?.regions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Regions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {usage.regions.map((region) => (
              <span key={region} className="px-2 py-1 text-xs rounded bg-muted">
                {region.toUpperCase()}
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
