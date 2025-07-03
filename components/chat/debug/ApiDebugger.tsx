"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ApiDebugger() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)

  const testEndpoint = async (action: string, payload: any) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/ai?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      setTestResults((prev) => ({
        ...prev,
        [action]: {
          status: response.status,
          success: data.success,
          data: data.data,
          error: data.error,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [action]: {
          status: "ERROR",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const tests = [
    {
      name: "Basic Chat",
      action: "conversationalFlow",
      payload: { message: "Hello, test message", conversationState: { messages: [] } },
    },
    {
      name: "Code Execution",
      action: "executeCode",
      payload: { prompt: "Calculate 2 + 2" },
    },
    {
      name: "Image Generation",
      action: "generateImage",
      payload: { prompt: "A simple test image" },
    },
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tests.map((test) => (
            <Button
              key={test.action}
              onClick={() => testEndpoint(test.action, test.payload)}
              disabled={isLoading}
              variant="outline"
            >
              Test {test.name}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {Object.entries(testResults).map(([action, result]) => (
            <Card key={action}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{action}</CardTitle>
                  <Badge variant={result.success ? "default" : "destructive"}>{result.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
