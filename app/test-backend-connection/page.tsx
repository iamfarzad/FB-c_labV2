'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TestBackendConnection() {
  const [taskPrompt, setTaskPrompt] = useState('Create a marketing strategy for Q4')
  const [webPreviewUrl, setWebPreviewUrl] = useState('https://example.com')
  const [taskResult, setTaskResult] = useState<any>(null)
  const [webPreviewResult, setWebPreviewResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testTaskGeneration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tools/task-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: taskPrompt,
          context: 'Marketing strategy for a tech company'
        })
      })
      
      if (!response.ok) throw new Error('Task generation failed')
      
      const result = await response.json()
      setTaskResult(result)
    } catch (error) {
      console.error('Task generation error:', error)
      setTaskResult({ error: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  const testWebPreview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tools/web-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webPreviewUrl })
      })
      
      if (!response.ok) throw new Error('Web preview failed')
      
      const result = await response.json()
      setWebPreviewResult(result)
    } catch (error) {
      console.error('Web preview error:', error)
      setWebPreviewResult({ error: (error as Error).message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Backend API Connection Test</h1>
          <p className="text-muted-foreground">
            Testing AI Elements backend integration
          </p>
        </div>

        <Separator />

        {/* Task Generation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Task Generation API Test
              <Badge variant="secondary">/api/tools/task-generator</Badge>
            </CardTitle>
            <CardDescription>
              Test the task generation endpoint with AI-powered task creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-prompt">Task Prompt</Label>
              <Input
                id="task-prompt"
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder="Enter a task prompt..."
              />
            </div>
            <Button onClick={testTaskGeneration} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Tasks'}
            </Button>
            
            {taskResult && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold mb-2">Result:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(taskResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Web Preview Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌐 Web Preview API Test
              <Badge variant="secondary">/api/tools/web-preview</Badge>
            </CardTitle>
            <CardDescription>
              Test the web preview endpoint for URL processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="web-preview-url">URL to Preview</Label>
              <Input
                id="web-preview-url"
                value={webPreviewUrl}
                onChange={(e) => setWebPreviewUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <Button onClick={testWebPreview} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Web Preview'}
            </Button>
            
            {webPreviewResult && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="font-semibold mb-2">Result:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(webPreviewResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Backend Integration Status</CardTitle>
            <CardDescription>
              Summary of AI Elements backend connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">✅ Connected APIs:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• /api/chat - Main chat with citations/sources</li>
                  <li>• /api/tools/roi - ROI calculator</li>
                  <li>• /api/tools/task-generator - Task generation</li>
                  <li>• /api/tools/web-preview - Web preview</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🔄 Data Flow:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Citations → GroundedCitation component</li>
                  <li>• Tasks → Task components</li>
                  <li>• Tools → Tool components</li>
                  <li>• Web Preview → WebPreview components</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Task Generation Test:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Enter a task prompt (e.g., "Create a marketing strategy")</li>
                  <li>• Click "Generate Tasks"</li>
                  <li>• Verify JSON response with title and items array</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Web Preview Test:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Enter a URL to preview</li>
                  <li>• Click "Generate Web Preview"</li>
                  <li>• Verify response with logs and metadata</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Integration Verification:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Both APIs should return 200 status</li>
                  <li>• JSON responses should be properly formatted</li>
                  <li>• Error handling should work for invalid inputs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
