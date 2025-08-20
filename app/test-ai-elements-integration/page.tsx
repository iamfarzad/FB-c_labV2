'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Import all AI Elements components for testing
import { GroundedCitation } from '@/components/ai-elements/inline-citation'
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from '@/components/ai-elements/task'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import { WebPreview, WebPreviewNavigation, WebPreviewNavigationButton, WebPreviewUrl, WebPreviewBody, WebPreviewConsole } from '@/components/ai-elements/web-preview'
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from 'lucide-react'

export default function TestAIElementsIntegration() {
  const [activeSection, setActiveSection] = useState<string>('all')

  const testCitations = [
    { uri: 'https://example.com/source1', title: 'Example Source 1' },
    { uri: 'https://example.com/source2', title: 'Example Source 2' },
    { uri: 'https://example.com/source3', title: 'Example Source 3' }
  ]

  const testTaskItems = [
    { label: 'Research market trends', files: ['market-report.pdf', 'competitor-analysis.docx'] },
    { label: 'Analyze customer feedback', files: ['feedback-survey.csv'] },
    { label: 'Create presentation slides', files: ['slides-template.pptx'] }
  ]

  const testToolData = {
    type: 'data_analysis',
    state: 'output-available' as const,
    input: { query: 'Analyze sales data for Q4 2024' },
    output: { 
      results: 'Sales increased by 15% compared to Q3',
      metrics: { revenue: '$2.5M', growth: '15%', customers: 1250 }
    }
  }

  const testWebPreviewLogs = [
    { level: 'log' as const, message: 'Page loaded successfully', timestamp: new Date() },
    { level: 'warn' as const, message: 'Slow loading detected', timestamp: new Date() },
    { level: 'error' as const, message: 'Failed to load external resource', timestamp: new Date() }
  ]

  const sections = [
    { id: 'all', label: 'All Components', icon: '🧪' },
    { id: 'citations', label: 'Citations', icon: '📚' },
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'web-preview', label: 'Web Preview', icon: '🌐' }
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI Elements Integration Test</h1>
          <p className="text-muted-foreground">
            Visual verification of all integrated AI Elements components
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Test Components */}
        <div className="grid gap-6">
          {/* Citations Test */}
          {(activeSection === 'all' || activeSection === 'citations') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📚 Citations Test
                  <Badge variant="secondary">GroundedCitation</Badge>
                </CardTitle>
                <CardDescription>
                  Testing inline citation display with hover cards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <p className="mb-4">
                    This is a test message with citations embedded in the text. 
                    According to recent research <GroundedCitation citations={testCitations} />, 
                    AI-powered tools can improve productivity by up to 40%.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <strong>Test Instructions:</strong> Hover over the citation badges to see source details
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks Test */}
          {(activeSection === 'all' || activeSection === 'tasks') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Tasks Test
                  <Badge variant="secondary">Task Components</Badge>
                </CardTitle>
                <CardDescription>
                  Testing task display with collapsible content and file attachments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Task defaultOpen={true}>
                  <TaskTrigger title="Market Research Project" />
                  <TaskContent>
                    {testTaskItems.map((item, idx) => (
                      <TaskItem key={idx}>
                        {item.label}
                        {item.files?.map((file, fileIdx) => (
                          <TaskItemFile key={fileIdx}>{file}</TaskItemFile>
                        ))}
                      </TaskItem>
                    ))}
                  </TaskContent>
                </Task>
                <div className="text-sm text-muted-foreground">
                  <strong>Test Instructions:</strong> Click the task header to expand/collapse
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tools Test */}
          {(activeSection === 'all' || activeSection === 'tools') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔧 Tools Test
                  <Badge variant="secondary">Tool Components</Badge>
                </CardTitle>
                <CardDescription>
                  Testing tool execution display with status badges and input/output
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tool defaultOpen={true}>
                  <ToolHeader 
                    type={testToolData.type} 
                    state={testToolData.state} 
                  />
                  <ToolContent>
                    <ToolInput input={testToolData.input} />
                    <ToolOutput 
                      output={JSON.stringify(testToolData.output, null, 2)} 
                      errorText={undefined} 
                    />
                  </ToolContent>
                </Tool>
                <div className="text-sm text-muted-foreground">
                  <strong>Test Instructions:</strong> Click the tool header to expand/collapse
                </div>
              </CardContent>
            </Card>
          )}

          {/* Web Preview Test */}
          {(activeSection === 'all' || activeSection === 'web-preview') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 Web Preview Test
                  <Badge variant="secondary">WebPreview Components</Badge>
                </CardTitle>
                <CardDescription>
                  Testing web preview with navigation and console logging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <WebPreview defaultUrl="https://example.com">
                  <WebPreviewNavigation>
                    <WebPreviewNavigationButton tooltip="Back" aria-label="Back">
                      <ArrowLeftIcon className="h-4 w-4" />
                    </WebPreviewNavigationButton>
                    <WebPreviewNavigationButton tooltip="Forward" aria-label="Forward">
                      <ArrowRightIcon className="h-4 w-4" />
                    </WebPreviewNavigationButton>
                    <WebPreviewUrl />
                    <WebPreviewNavigationButton tooltip="Open in new tab" aria-label="Open in new tab">
                      <ExternalLinkIcon className="h-4 w-4" />
                    </WebPreviewNavigationButton>
                  </WebPreviewNavigation>
                  <WebPreviewBody className="h-64 bg-muted/20 border rounded-md flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Web Preview Content</p>
                      <p className="text-sm">(Mock iframe content would appear here)</p>
                    </div>
                  </WebPreviewBody>
                  <WebPreviewConsole logs={testWebPreviewLogs} />
                </WebPreview>
                <div className="text-sm text-muted-foreground">
                  <strong>Test Instructions:</strong> Check navigation buttons, URL input, and console logs
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✅ Integration Status
              </CardTitle>
              <CardDescription>
                Summary of AI Elements integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">✅ Successfully Integrated:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• GroundedCitation (inline citations)</li>
                    <li>• Task components (collapsible tasks)</li>
                    <li>• Tool components (execution display)</li>
                    <li>• WebPreview components (web content)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">🔄 Avoided Duplication:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Message components (kept custom)</li>
                    <li>• Conversation components (kept custom)</li>
                    <li>• Response components (kept custom)</li>
                    <li>• PromptInput components (kept custom)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Manual Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Citations Test:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Hover over citation badges</li>
                  <li>• Verify hover cards appear</li>
                  <li>• Check source URLs are correct</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tasks Test:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Click task header to expand</li>
                  <li>• Verify file attachments display</li>
                  <li>• Test collapse functionality</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tools Test:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Check status badge colors</li>
                  <li>• Expand to see input/output</li>
                  <li>• Verify JSON formatting</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Web Preview Test:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Test navigation buttons</li>
                  <li>• Check URL input field</li>
                  <li>• Verify console logs display</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
