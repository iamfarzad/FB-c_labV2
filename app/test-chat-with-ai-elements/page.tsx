'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { User } from 'lucide-react'

// Import AI Elements components
import { GroundedCitation } from '@/components/ai-elements/inline-citation'
import { Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from '@/components/ai-elements/task'
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import { WebPreview, WebPreviewNavigation, WebPreviewNavigationButton, WebPreviewUrl, WebPreviewBody, WebPreviewConsole } from '@/components/ai-elements/web-preview'
import { ArrowLeftIcon, ArrowRightIcon, ExternalLinkIcon } from 'lucide-react'

interface TestMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'default' | 'tool' | 'task' | 'web-preview'
  metadata?: {
    citations?: Array<{ uri: string; title?: string }>
    tools?: Array<{ type: string; data: any; state?: string }>
    task?: { title: string; items?: Array<{ label: string; files?: string[] }> }
    webPreview?: { url: string; logs?: Array<{ level: string; message: string; timestamp: Date }> }
  }
}

export default function TestChatWithAIElements() {
  const [messages, setMessages] = useState<TestMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'Can you analyze the market trends and create a task list for our Q4 strategy?'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I\'ll analyze the market trends and create a comprehensive task list for your Q4 strategy. Let me start by researching current market conditions.',
      metadata: {
        citations: [
          { uri: 'https://marketresearch.com/trends-2024', title: 'Market Trends 2024' },
          { uri: 'https://industryreport.com/q3-analysis', title: 'Q3 Industry Analysis' }
        ]
      }
    },
    {
      id: '3',
      role: 'assistant',
      content: 'Based on my analysis, here are the key tasks for your Q4 strategy:',
      type: 'task',
      metadata: {
        task: {
          title: 'Q4 Strategy Implementation',
          items: [
            { label: 'Conduct competitor analysis', files: ['competitor-report.pdf'] },
            { label: 'Review customer feedback data', files: ['feedback-q3.csv', 'survey-results.xlsx'] },
            { label: 'Develop marketing campaigns', files: ['campaign-brief.docx'] },
            { label: 'Prepare budget allocation', files: ['budget-template.xlsx'] }
          ]
        }
      }
    },
    {
      id: '4',
      role: 'assistant',
      content: 'I\'ve also run a data analysis on your current performance metrics:',
      type: 'tool',
      metadata: {
        tools: [{
          type: 'data_analysis',
          state: 'output-available',
          data: {
            revenue: '$2.5M',
            growth: '15%',
            customers: 1250,
            churn_rate: '2.1%'
          }
        }]
      }
    },
    {
      id: '5',
      role: 'assistant',
      content: 'Let me also show you a web preview of the latest industry report:',
      type: 'web-preview',
      metadata: {
        webPreview: {
          url: 'https://industryreport.com/latest',
          logs: [
            { level: 'log', message: 'Page loaded successfully', timestamp: new Date() },
            { level: 'warn', message: 'Some images failed to load', timestamp: new Date() }
          ]
        }
      }
    }
  ])

  const addTestMessage = (type: 'citations' | 'task' | 'tool' | 'web-preview') => {
    const newMessage: TestMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Test ${type} message`,
      type: type === 'citations' ? 'default' : type,
      metadata: {}
    }

    switch (type) {
      case 'citations':
        newMessage.metadata!.citations = [
          { uri: 'https://example.com/test1', title: 'Test Source 1' },
          { uri: 'https://example.com/test2', title: 'Test Source 2' }
        ]
        break
      case 'task':
        newMessage.metadata!.task = {
          title: 'Test Task',
          items: [
            { label: 'Test task item 1', files: ['test-file1.pdf'] },
            { label: 'Test task item 2', files: ['test-file2.docx'] }
          ]
        }
        break
      case 'tool':
        newMessage.metadata!.tools = [{
          type: 'test_tool',
          state: 'output-available',
          data: { result: 'Test tool output', status: 'success' }
        }]
        break
      case 'web-preview':
        newMessage.metadata!.webPreview = {
          url: 'https://example.com',
          logs: [
            { level: 'log', message: 'Test log message', timestamp: new Date() }
          ]
        }
        break
    }

    setMessages(prev => [...prev, newMessage])
  }

  const MessageComponent = ({ message }: { message: TestMessage }) => {
    return (
      <div className="flex items-start gap-3 p-4">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
            {message.role === 'assistant' ? (
              <FbcIcon className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {/* Citations */}
            {message.metadata?.citations && message.metadata.citations.length > 0 && (
              <div className="mt-3">
                <GroundedCitation citations={message.metadata.citations} />
              </div>
            )}

            {/* Task display */}
            {message.type === 'task' && message.metadata?.task && (
              <div className="mt-3">
                <Task defaultOpen={false}>
                  <TaskTrigger title={message.metadata.task.title} />
                  <TaskContent>
                    {message.metadata.task.items?.map((item, idx) => (
                      <TaskItem key={idx}>
                        {item.label}
                        {item.files?.map((file, fileIdx) => (
                          <TaskItemFile key={fileIdx}>{file}</TaskItemFile>
                        ))}
                      </TaskItem>
                    ))}
                  </TaskContent>
                </Task>
              </div>
            )}

            {/* Tool display */}
            {message.type === 'tool' && message.metadata?.tools?.length && (
              <div className="mt-3">
                {message.metadata.tools.map((t, i) => (
                  <Tool key={`tool-${message.id}-${i}`} defaultOpen={false}>
                    <ToolHeader type={t.type as any} state={t.state as any} />
                    <ToolContent>
                      <ToolOutput output={JSON.stringify(t.data, null, 2)} errorText={undefined} />
                    </ToolContent>
                  </Tool>
                ))}
              </div>
            )}

            {/* Web Preview */}
            {message.type === 'web-preview' && message.metadata?.webPreview && (
              <div className="mt-3">
                <WebPreview defaultUrl={message.metadata.webPreview.url}>
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
                  <WebPreviewBody className="h-48 bg-muted/20 border rounded-md flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Web Preview Content</p>
                      <p className="text-sm">(Mock iframe content)</p>
                    </div>
                  </WebPreviewBody>
                  <WebPreviewConsole logs={message.metadata.webPreview.logs || []} />
                </WebPreview>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Chat Interface with AI Elements Test</h1>
          <p className="text-muted-foreground">
            Testing AI Elements integration in a chat-like environment
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🧪 Test Controls</CardTitle>
            <CardDescription>
              Add different types of test messages to verify AI Elements integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => addTestMessage('citations')} variant="outline">
                📚 Add Citations
              </Button>
              <Button onClick={() => addTestMessage('task')} variant="outline">
                📋 Add Task
              </Button>
              <Button onClick={() => addTestMessage('tool')} variant="outline">
                🔧 Add Tool
              </Button>
              <Button onClick={() => addTestMessage('web-preview')} variant="outline">
                🌐 Add Web Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Chat Interface
              <Badge variant="secondary">{messages.length} messages</Badge>
            </CardTitle>
            <CardDescription>
              Simulated chat interface showing AI Elements integration
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <MessageComponent key={message.id} message={message} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Visual Verification:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Check message layout and avatars</li>
                  <li>• Verify citations appear with hover cards</li>
                  <li>• Test task expansion/collapse</li>
                  <li>• Check tool status badges and content</li>
                  <li>• Verify web preview navigation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Interaction Testing:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use test controls to add new messages</li>
                  <li>• Hover over citation badges</li>
                  <li>• Click task headers to expand</li>
                  <li>• Expand tool sections</li>
                  <li>• Test web preview navigation buttons</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
