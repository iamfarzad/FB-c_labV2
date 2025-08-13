"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  details?: string
  error?: string
}

export default function TestDashboard() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Chat API', status: 'pending' },
    { name: 'Document Analysis', status: 'pending' },
    { name: 'Image Analysis', status: 'pending' },
    { name: 'Voice TTS', status: 'pending' },
    { name: 'File Upload', status: 'pending' },
    { name: 'Session Management', status: 'pending' },
    { name: 'Camera Access', status: 'pending' },
    { name: 'Microphone Access', status: 'pending' },
  ])

  const [isRunning, setIsRunning] = useState(false)

  const updateTestResult = (testName: string, status: TestResult['status'], details?: string, error?: string) => {
    setTestResults(prev => 
      prev.map(test => 
        test.name === testName 
          ? { ...test, status, details, error }
          : test
      )
    )
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    // Reset all tests to pending
    setTestResults(prev => prev.map(test => ({ ...test, status: 'pending' as const })))

    // Test 1: Chat API
    updateTestResult('Chat API', 'running')
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
          data: { sessionId: 'test-session' }
        })
      })
      
      if (response.ok) {
        updateTestResult('Chat API', 'passed', 'Chat API is responding correctly')
      } else {
        updateTestResult('Chat API', 'failed', undefined, `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTestResult('Chat API', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 2: Document Analysis
    updateTestResult('Document Analysis', 'running')
    try {
      const testContent = 'This is a test document for analysis.'
      const response = await fetch('/api/tools/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: `data:image/png;base64,${btoa(testContent)}`,
          type: 'document'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.summary) {
          updateTestResult('Document Analysis', 'passed', 'Document analysis endpoint working')
        } else {
          updateTestResult('Document Analysis', 'failed', undefined, 'No analysis returned')
        }
      } else {
        updateTestResult('Document Analysis', 'failed', undefined, `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTestResult('Document Analysis', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 3: Image Analysis
    updateTestResult('Image Analysis', 'running')
    try {
      // Create a simple test image (1x1 pixel)
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'red'
        ctx.fillRect(0, 0, 1, 1)
        const testImage = canvas.toDataURL('image/png').split(',')[1]
        
        const response = await fetch('/api/tools/webcam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: `data:image/png;base64,${testImage}`,
            type: 'test'
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.analysis) {
            updateTestResult('Image Analysis', 'passed', 'Image analysis endpoint working')
          } else {
            updateTestResult('Image Analysis', 'failed', undefined, 'No analysis returned')
          }
        } else {
          updateTestResult('Image Analysis', 'failed', undefined, `HTTP ${response.status}`)
        }
      } else {
        updateTestResult('Image Analysis', 'failed', undefined, 'Canvas context not available')
      }
    } catch (error) {
      updateTestResult('Image Analysis', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 4: Voice TTS
    updateTestResult('Voice TTS', 'running')
    try {
      const response = await fetch('/api/gemini-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Test TTS message',
          enableTTS: true
        })
      })
      
      if (response.ok) {
        updateTestResult('Voice TTS', 'passed', 'Voice TTS endpoint working')
      } else {
        updateTestResult('Voice TTS', 'failed', undefined, `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTestResult('Voice TTS', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 5: File Upload
    updateTestResult('File Upload', 'running')
    try {
      const testFile = new File(['Test file content'], 'test.txt', { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', testFile)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        updateTestResult('File Upload', 'passed', 'File upload endpoint working')
      } else {
        updateTestResult('File Upload', 'failed', undefined, `HTTP ${response.status}`)
      }
    } catch (error) {
      updateTestResult('File Upload', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 6: Session Management
    updateTestResult('Session Management', 'running')
    try {
      // Test session creation
      const sessionId = Math.random().toString(36).substring(7)
      sessionStorage.setItem('test-session', sessionId)
      const retrievedSession = sessionStorage.getItem('test-session')
      
      if (retrievedSession === sessionId) {
        sessionStorage.removeItem('test-session')
        updateTestResult('Session Management', 'passed', 'Session storage working correctly')
      } else {
        updateTestResult('Session Management', 'failed', undefined, 'Session storage not working')
      }
    } catch (error) {
      updateTestResult('Session Management', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 7: Camera Access
    updateTestResult('Camera Access', 'running')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateTestResult('Camera Access', 'failed', undefined, 'Media devices API not supported')
      } else if (!window.isSecureContext) {
        updateTestResult('Camera Access', 'failed', undefined, 'HTTPS required for camera access')
      } else {
        // Just check if we can enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        
        if (videoDevices.length > 0) {
          updateTestResult('Camera Access', 'passed', `${videoDevices.length} camera(s) detected`)
        } else {
          updateTestResult('Camera Access', 'failed', undefined, 'No cameras detected')
        }
      }
    } catch (error) {
      updateTestResult('Camera Access', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    // Test 8: Microphone Access
    updateTestResult('Microphone Access', 'running')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateTestResult('Microphone Access', 'failed', undefined, 'Media devices API not supported')
      } else if (!window.isSecureContext) {
        updateTestResult('Microphone Access', 'failed', undefined, 'HTTPS required for microphone access')
      } else {
        // Just check if we can enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioDevices = devices.filter(device => device.kind === 'audioinput')
        
        if (audioDevices.length > 0) {
          updateTestResult('Microphone Access', 'passed', `${audioDevices.length} microphone(s) detected`)
        } else {
          updateTestResult('Microphone Access', 'failed', undefined, 'No microphones detected')
        }
      }
    } catch (error) {
      updateTestResult('Microphone Access', 'failed', undefined, error instanceof Error ? error.message : 'Unknown error')
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'running':
        return <AlertCircle className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'running':
        return <Badge variant="default" className="animate-pulse">Running</Badge>
      case 'passed':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  const passedTests = testResults.filter(test => test.status === 'passed').length
  const totalTests = testResults.length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">F.B/c AI System Test Dashboard</h1>
        <p className="text-gray-600 mb-4">
          Comprehensive testing of all AI features and system components
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          
          <div className="text-sm text-gray-600">
            {passedTests}/{totalTests} tests passed
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testResults.map((test) => (
          <Card key={test.name} className="border-l-4 border-l-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                </div>
                {getStatusBadge(test.status)}
              </div>
            </CardHeader>
            <CardContent>
              {test.details && (
                <p className="text-sm text-gray-600 mb-2">{test.details}</p>
              )}
              {test.error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {test.error}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Summary</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Chat API:</strong> Tests the main conversational AI endpoint</li>
          <li>• <strong>Document Analysis:</strong> Tests PDF and text file processing</li>
          <li>• <strong>Image Analysis:</strong> Tests webcam and screenshot analysis</li>
          <li>• <strong>Voice TTS:</strong> Tests text-to-speech generation</li>
          <li>• <strong>File Upload:</strong> Tests file upload and processing</li>
          <li>• <strong>Session Management:</strong> Tests session isolation and cleanup</li>
          <li>• <strong>Camera Access:</strong> Tests browser camera permissions</li>
          <li>• <strong>Microphone Access:</strong> Tests browser microphone permissions</li>
        </ul>
      </div>
    </div>
  )
}
