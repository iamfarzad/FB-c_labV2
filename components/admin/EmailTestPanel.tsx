"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<{
    success: boolean
    results?: {
      leadFollowUp: boolean
      meetingConfirmation: boolean
    }
    message: string
    error?: string
  } | null>(null)

  const runEmailTest = async () => {
    if (!testEmail) {
      alert("Please enter your email address for testing")
      return
    }

    setTesting(true)
    setTestResults(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail }),
      })

      const data = await response.json()
      setTestResults(data)
    } catch (error: any) {
      setTestResults({
        success: false,
        message: "Failed to run email test",
        error: error.message,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email System Test
        </CardTitle>
        <CardDescription>Test the email functionality with your Resend API configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter your email for testing"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            type="email"
          />
          <Button onClick={runEmailTest} disabled={testing || !testEmail}>
            {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Test Emails
          </Button>
        </div>

        {testResults && (
          <Alert className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={testResults.success ? "text-green-800" : "text-red-800"}>
                {testResults.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {testResults?.results && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            <div className="flex gap-2">
              <Badge variant={testResults.results.leadFollowUp ? "default" : "destructive"}>
                Lead Follow-up: {testResults.results.leadFollowUp ? "✅ Sent" : "❌ Failed"}
              </Badge>
              <Badge variant={testResults.results.meetingConfirmation ? "default" : "destructive"}>
                Meeting Confirmation: {testResults.results.meetingConfirmation ? "✅ Sent" : "❌ Failed"}
              </Badge>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>This will send test emails to verify:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Lead follow-up email with AI capabilities summary</li>
            <li>Meeting confirmation email with calendar details</li>
            <li>Professional email templates and branding</li>
            <li>Resend API integration and delivery</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
