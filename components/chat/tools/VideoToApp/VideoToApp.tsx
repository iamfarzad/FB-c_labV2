"use client"

import { useState } from "react"
import { Video, Sparkles, Loader2, Link, X } from "@/lib/icon-mapping"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import type { VideoToAppProps } from "./VideoToApp.types"

export function VideoToApp({ 
  mode = 'card',
  videoUrl: initialVideoUrl = "",
  onClose,
  onCancel,
  onAppGenerated,
  onAnalysisComplete
}: VideoToAppProps) {
  const { toast } = useToast()
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [userPrompt, setUserPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAppUrl, setGeneratedAppUrl] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [progress, setProgress] = useState<"idle" | "analyze" | "spec" | "code" | "ready">("idle")
  const [emailGateOpen, setEmailGateOpen] = useState(false)
  const [emailGateOk, setEmailGateOk] = useState(false)
  const [gateEmail, setGateEmail] = useState("")
  const [gateCompany, setGateCompany] = useState("")
  const [isSubmittingGate, setIsSubmittingGate] = useState(false)
  const [leadId, setLeadId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!videoUrl) {
      toast({
        title: "Missing Information",
        description: "Please provide a video URL.",
        variant: "destructive",
      })
      return
    }
    
    setIsGenerating(true)
    setProgress("analyze")
    setGeneratedAppUrl(null)
    setGeneratedCode(null)
    
    try {
      // Step 1: Generate specification from video
      toast({
        title: "Analyzing Video",
        description: "Generating app specification from video content...",
      })

      const specResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "generateSpec", 
          videoUrl,
          userPrompt
        }),
      })

      if (!specResponse.ok) {
        const errorData = await specResponse.json()
        throw new Error(errorData.details || 'Failed to generate specification')
      }

      const specResult = await specResponse.json()
      if (specResult?.error) throw new Error(specResult.error)
      if (!specResult?.spec) throw new Error('Invalid spec response')
      setProgress("spec")
      
      // Step 2: Generate code from specification
      toast({
        title: "Creating App",
        description: "Generating interactive learning app code...",
      })

      const codeResponse = await fetch('/api/video-to-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: "generateCode", 
          spec: specResult.spec 
        }),
      })

      if (!codeResponse.ok) {
        const errorData = await codeResponse.json()
        throw new Error(errorData.details || 'Failed to generate application code')
      }

      const codeResult = await codeResponse.json()
      if (codeResult?.error) throw new Error(codeResult.error)
      if (!codeResult?.code) throw new Error('Invalid code response')
      setProgress("code")
      
      // Create blob URL for the generated app
      const blob = new Blob([codeResult.code], { type: 'text/html' })
      const appUrl = URL.createObjectURL(blob)
      
      setGeneratedAppUrl(appUrl)
      setGeneratedCode(codeResult.code)
      onAppGenerated?.(appUrl)
      
      toast({
        title: "App Generated Successfully!",
        description: "Your interactive learning app is ready to use.",
      })
      setProgress("ready")
      // If user has already provided email via gate, send link automatically
      try {
        if (emailGateOk && gateEmail && codeResult.artifactId) {
          // Link artifact to lead if available
          if (leadId) {
            try {
              await fetch(`/api/artifacts/${codeResult.artifactId}/link-lead`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId })
              })
              // Increment engagement score (best-effort)
              try {
                await fetch(`/api/leads/${leadId}/engagement`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ interactionType: 'artifact_generated' })
                })
              } catch {}
            } catch {}
          }
          await fetch('/api/send-artifact-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: gateEmail, artifactId: codeResult.artifactId })
          })
        }
      } catch {}

    } catch (error) {
      const err = error as Error;
      toast({
        title: "Generation Failed",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const VideoToAppUI = () => (
    <div className="h-full flex">
      {/* Main Video to App Area */}
      <div className="flex-1 p-4">
        {!generatedAppUrl ? (
          <div className="h-full flex items-center justify-center">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Video className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Video to Learning App</h2>
                  <p className="text-slate-600">Transform any video into an interactive learning experience</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Video URL</label>
                    <Input
                      placeholder="Enter video URL (e.g., YouTube, Vimeo)"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={isGenerating}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Learning Objectives</label>
                    <Input
                      placeholder="Describe the learning app you want to create"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      disabled={isGenerating}
                      className="w-full"
                    />
                  </div>

                  {/* Progress tracker */}
                  {(isGenerating || progress !== 'idle') && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={cn('h-3 w-3 rounded-full', progress === 'analyze' ? 'bg-blue-500 animate-pulse' : progress !== 'idle' ? 'bg-green-500' : 'bg-slate-300')}></span>
                          <span className={progress === 'analyze' ? 'text-blue-600 font-medium' : progress !== 'idle' ? 'text-green-600' : 'text-slate-500'}>
                            Analyze Video
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('h-3 w-3 rounded-full', progress === 'spec' ? 'bg-blue-500 animate-pulse' : ['code', 'ready'].includes(progress) ? 'bg-green-500' : 'bg-slate-300')}></span>
                          <span className={progress === 'spec' ? 'text-blue-600 font-medium' : ['code', 'ready'].includes(progress) ? 'text-green-600' : 'text-slate-500'}>
                            Generate Spec
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('h-3 w-3 rounded-full', progress === 'code' ? 'bg-blue-500 animate-pulse' : progress === 'ready' ? 'bg-green-500' : 'bg-slate-300')}></span>
                          <span className={progress === 'code' ? 'text-blue-600 font-medium' : progress === 'ready' ? 'text-green-600' : 'text-slate-500'}>
                            Generate App
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleGenerate} disabled={isGenerating || !videoUrl} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Learning App...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Learning App
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full bg-slate-900 rounded-lg overflow-hidden relative">
            <iframe
              src={generatedAppUrl}
              className="w-full h-full"
              title="Generated Learning App Preview"
              sandbox="allow-scripts allow-same-origin"
            />
            
            {/* App Controls Overlay */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <Button variant="secondary" size="sm" onClick={() => window.open(generatedAppUrl, '_blank')}>
                  <Link className="w-4 h-4 mr-2" /> Open
                </Button>
                <Button variant="secondary" size="sm" onClick={() => {
                  setGeneratedAppUrl(null)
                  setGeneratedCode(null)
                  setProgress("idle")
                }}>
                  New App
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-slate-200 p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">Generation Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Video Analysis</span>
                <span className={cn('px-2 py-1 rounded text-xs', 
                  ['analyze', 'spec', 'code', 'ready'].includes(progress) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {['analyze', 'spec', 'code', 'ready'].includes(progress) ? 'Complete' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>App Specification</span>
                <span className={cn('px-2 py-1 rounded text-xs', 
                  ['spec', 'code', 'ready'].includes(progress) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {['spec', 'code', 'ready'].includes(progress) ? 'Complete' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Code Generation</span>
                <span className={cn('px-2 py-1 rounded text-xs', 
                  ['ready'].includes(progress) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                )}>
                  {progress === 'ready' ? 'Complete' : 'Pending'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {generatedAppUrl && generatedCode && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">Export Options</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={async () => {
                    if (!emailGateOk) { setEmailGateOpen(true); return }
                    try {
                      await navigator.clipboard.writeText(generatedCode)
                      toast({ title: 'Copied', description: 'HTML copied to clipboard' })
                    } catch {}
                  }}
                >
                  Copy HTML Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    if (!emailGateOk) { setEmailGateOpen(true); return }
                    const file = new Blob([generatedCode], { type: 'text/html' })
                    const url = URL.createObjectURL(file)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'learning-app.html'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Download HTML
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setEmailGateOpen(true)}
                >
                  Email Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                View Examples
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Learning Templates
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Help & Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3">Tips</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>• Use clear, educational videos for best results</p>
              <p>• Describe specific learning objectives</p>
              <p>• Generated apps work on all devices</p>
              <p>• Apps include interactive elements automatically</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video to App Generator
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <VideoToAppUI />
        </DialogContent>
      </Dialog>
    )
  }

  if (mode === 'canvas') {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        {(
          <div className="flex h-10 items-center justify-between border-b px-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>Video → App</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleGenerate} disabled={isGenerating || !videoUrl}>
                Generate
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col p-2">
          <VideoToAppUI />
        </div>
        {/* Email Gate Modal */}
        <Dialog open={emailGateOpen} onOpenChange={setEmailGateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send the app to your email</DialogTitle>
              <DialogDescription>We’ll send you a link to the generated app and keep you updated with relevant materials.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const email = gateEmail.trim()
                if (!email) return
                setIsSubmittingGate(true)
                try {
                  await fetch('/api/consent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, companyUrl: gateCompany || undefined, policyVersion: 'v1' })
                  })
                  // Upsert lead for analytics
                  try {
                    const res = await fetch('/api/lead-upsert', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, name: email.split('@')[0], companyUrl: gateCompany || undefined })
                    })
                    if (res.ok) {
                      const j = await res.json()
                      if (j.leadId) setLeadId(j.leadId)
                    }
                  } catch {}
                  setEmailGateOk(true)
                  setEmailGateOpen(false)
                } catch {}
                setIsSubmittingGate(false)
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm mb-1">Work email</label>
                <Input type="email" value={gateEmail} onChange={(e) => setGateEmail(e.target.value)} placeholder="name@company.com" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Company website (optional)</label>
                <Input value={gateCompany} onChange={(e) => setGateCompany(e.target.value)} placeholder="https://yourcompany.com" />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="h-9 rounded-md border px-3 text-sm border-border/50 bg-card/60 text-muted-foreground hover:text-foreground" onClick={() => setEmailGateOpen(false)} disabled={isSubmittingGate}>Cancel</button>
                <button type="submit" className={`h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground ${isSubmittingGate ? 'opacity-70' : ''}`} disabled={isSubmittingGate}>
                  {isSubmittingGate ? 'Saving…' : 'Send Link'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper
      title="Video-to-Learning App"
      description="Create an interactive learning app from a video URL."
      icon={<Video className="w-4 h-4" />}
    >
      <VideoToAppUI />
    </ToolCardWrapper>
  )
}

// Email gate modal at root to enable export actions
// Rendered within component above when emailGateOpen is true
