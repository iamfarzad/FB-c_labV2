"use client"

import { DemoSessionProvider } from "@/components/demo-session-manager"
import { PageShell } from "@/components/page-shell"
import { UnifiedChatInterface } from "@/components/chat/unified/UnifiedChatInterface"
import { useState, useEffect, useMemo } from "react"
import type { UnifiedMessage } from "@/components/chat/unified/UnifiedChatInterface"
import { useConversationalIntelligence } from "@/hooks/useConversationalIntelligence"
import { ErrorHandler } from "@/components/chat/ErrorHandler"
import VoiceOverlay from "@/components/chat/VoiceOverlay"
import { LeadProgressIndicator } from "@/components/chat/LeadProgressIndicator"
import SuggestedActions from "@/components/intelligence/SuggestedActions"
import { ConversationStage } from "@/lib/lead-manager"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import ErrorBoundary from "@/components/common/ErrorBoundary"

// Finish & Email Button Component
function FinishAndEmailButton({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('contact@farzadbayat.com')
  const [isSending, setIsSending] = useState(false)
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-accent/30 hover:border-accent hover:bg-accent/10"
        onClick={() => setOpen(true)}
      >
        Finish & Email
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send summary via email</DialogTitle>
            <DialogDescription>We'll generate the PDF and email it to the recipient.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const toEmail = email.trim()
              if (!toEmail) return
              setIsSending(true)
              try {
                const gen = await fetch('/api/export-summary', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ sessionId }) 
                })
                if (!gen.ok) throw new Error(`export failed: ${gen.status}`)
                const res = await fetch('/api/send-pdf-summary', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ sessionId, toEmail }) 
                })
                if (!res.ok) throw new Error(`send failed: ${res.status}`)
                setOpen(false)
              } catch (e: any) {
                console.error('Email error:', e?.message || 'unknown')
              } finally {
                setIsSending(false)
              }
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="finish-email">Recipient email</Label>
              <Input 
                id="finish-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpen(false)} 
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isSending ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<UnifiedMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [openVoice, setOpenVoice] = useState(false)
  const [input, setInput] = useState("")
  const [stage, setStage] = useState<ConversationStage>(ConversationStage.GREETING)
  const [lead, setLead] = useState<{ name?: string; email?: string; company?: string } | undefined>()
  
  // Consent Management
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentAllowed, setConsentAllowed] = useState(false)
  const [consentDenied, setConsentDenied] = useState(false)
  const [consentEmail, setConsentEmail] = useState('')
  const [consentCompany, setConsentCompany] = useState('')

  // Conversational Intelligence
  const { 
    context, 
    isLoading: contextLoading, 
    fetchContextFromLocalSession, 
    clearContextCache, 
    generatePersonalizedGreeting 
  } = useConversationalIntelligence()

  const leadContextData = useMemo(() => {
    if (!context) return undefined
    return {
      name: context?.person?.fullName || context?.lead?.name,
      email: context?.lead?.email,
      company: context?.company?.name,
      role: context?.role,
      industry: context?.company?.industry,
    }
  }, [context])

  // Message persistence (by sessionId)
  const STORAGE_PREFIX = 'fbc:chat:messages:'
  const STORAGE_VERSION = 'v1'
  const storageKey = (sid: string) => `${STORAGE_PREFIX}${sid}:${STORAGE_VERSION}`

  // Hydrate messages when session is available
  useEffect(() => {
    if (!sessionId) return
    try {
      const raw = localStorage.getItem(storageKey(sessionId))
      if (!raw) return
      const parsed = JSON.parse(raw) as UnifiedMessage[]
      // revive timestamps
      const revived = parsed.map(m => ({
        ...m,
        metadata: m.metadata ? { ...m.metadata, timestamp: m.metadata.timestamp ? new Date(m.metadata.timestamp as any) : undefined } : undefined
      }))
      setMessages(revived)
    } catch {}
  }, [sessionId])

  // Persist messages on change
  useEffect(() => {
    if (!sessionId) return
    try {
      const serializable = messages.map(m => ({
        ...m,
        metadata: m.metadata ? { ...m.metadata, timestamp: m.metadata.timestamp ? new Date(m.metadata.timestamp as any).toISOString() : undefined } : undefined
      }))
      localStorage.setItem(storageKey(sessionId), JSON.stringify(serializable))
    } catch {}
  }, [messages, sessionId])

  useEffect(() => {
    // Initialize session from localStorage
    const storedSessionId = localStorage.getItem('intelligence-session-id')
    if (storedSessionId) {
      setSessionId(storedSessionId)
    }
  }, [])

  // Check consent on mount
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/consent', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          if (j.allow) {
            setConsentAllowed(true)
            const existingSessionId = window.localStorage.getItem('intelligence-session-id')
            if (existingSessionId) {
              console.info('🔄 Restoring existing session:', existingSessionId)
              setSessionId(existingSessionId)
            }
          }
        }
      } catch {}
      setConsentChecked(true)
    })()
  }, [])

  // Fetch intelligence context when consent is allowed
  useEffect(() => {
    if (consentAllowed) {
      fetchContextFromLocalSession()
    }
  }, [consentAllowed, fetchContextFromLocalSession])

  async function handleAllowConsent() {
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: consentEmail, companyUrl: consentCompany, policyVersion: 'v1' }),
      })
      if (!res.ok) throw new Error('consent failed')
      
      const sessionInitRes = await fetch('/api/intelligence/session-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: sessionId || undefined,
          email: consentEmail, 
          name: consentEmail.split('@')[0],
          companyUrl: consentCompany 
        }),
      })
      
      if (sessionInitRes.ok) {
        const sessionData = await sessionInitRes.json()
        if (sessionData.sessionId) {
          localStorage.setItem('intelligence-session-id', sessionData.sessionId)
          setSessionId(sessionData.sessionId)
          clearContextCache()
          await fetchContextFromLocalSession({ force: true })
        }
      }
      
      setConsentAllowed(true)
      setConsentDenied(false)
    } catch (error) {
      console.error('Consent or session init failed:', error)
      alert('Unable to record consent. Please check your email/company and try again.')
    }
  }

  function handleDenyConsent() {
    setConsentDenied(true)
    setConsentAllowed(false)
  }

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: UnifiedMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      metadata: {
        timestamp: new Date()
      }
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      // Send to API with lead context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
          enableLeadGeneration: true,
          leadContext: leadContextData
        })
      })

      if (!response.ok) throw new Error('Chat request failed')

      const data = await response.json()
      
      // Update stage if provided
      if (data.conversationStage) {
        setStage(data.conversationStage as ConversationStage)
      }
      
      // Update lead data if provided
      if (data.leadData) {
        setLead(data.leadData)
      }
      
      // Add assistant message
      const assistantMessage: UnifiedMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.content || data.message || '',
        metadata: {
          timestamp: new Date(),
          sources: data.sources,
          citations: data.citations,
          suggestions: data.suggestions
        }
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearMessages = () => {
    setMessages([])
    setError(null)
    try {
      if (sessionId) localStorage.removeItem(storageKey(sessionId))
    } catch {}
  }

  const handleToolAction = (tool: string, data?: any) => {
    console.log('Tool action:', tool, data)
    if (tool === 'roi:complete') {
      const toolMessage: UnifiedMessage = {
        id: `msg-${Date.now()}-roi` ,
        role: 'assistant',
        type: 'tool',
        content: 'ROI analysis complete. Here is your summary:',
        metadata: {
          timestamp: new Date(),
          tools: [{ type: 'roiResult', data }]
        }
      }
      setMessages(prev => [...prev, toolMessage])
    }
  }

  const handleSuggestionRun = (suggestion: { id?: string; capability?: string; label: string }) => {
    console.log('Suggestion run:', suggestion)
    // Handle suggestion actions
    if (suggestion.capability === 'voice') {
      setOpenVoice(true)
    }
  }

  // Add personalized greeting message when context is loaded
  useEffect(() => {
    if (context && messages.length === 0 && !isLoading && consentAllowed) {
      const greetingMessage: UnifiedMessage = {
        id: `msg-greeting-${Date.now()}`,
        role: 'assistant',
        content: generatePersonalizedGreeting(context),
        metadata: {
          timestamp: new Date()
        }
      }
      setMessages([greetingMessage])
    }
  }, [context, messages.length, isLoading, consentAllowed, generatePersonalizedGreeting])

  return (
    <DemoSessionProvider>
      <PageShell variant="fullscreen">
        <div className="h-[100dvh] relative">
          {/* Consent Dialog */}
          {consentChecked && !consentAllowed && !consentDenied && (
            <div className="absolute inset-0 z-50 bg-background/95 grid place-items-center p-4">
              <div className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-foreground">
                  Personalize this chat using your public company info?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll fetch from your company site and LinkedIn to ground results with citations. 
                  See our <a href="/privacy" className="underline text-accent">Privacy & Terms</a>.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Input
                    type="email"
                    placeholder="Work email (name@company.com)"
                    value={consentEmail}
                    onChange={(e) => setConsentEmail(e.target.value)}
                    className="bg-card border-border text-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Company website (optional)"
                    value={consentCompany}
                    onChange={(e) => setConsentCompany(e.target.value)}
                    className="bg-card border-border text-foreground"
                  />
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleDenyConsent}
                    className="border-border"
                  >
                    No thanks
                  </Button>
                  <Button 
                    onClick={handleAllowConsent}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Allow
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Consent Denied Message */}
          {consentDenied && (
            <div className="absolute inset-0 z-50 bg-background/95 grid place-items-center p-4">
              <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 text-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Consent is required to continue
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We use public company info with citations to personalize results. 
                  Review our <a href="/privacy" className="underline text-accent">policy</a> and start again anytime.
                </p>
              </div>
            </div>
          )}

          {/* Main Chat Interface */}
          <ErrorBoundary fallback={(e, reset) => (
            <div className="mx-auto max-w-3xl p-4">
              <div className="rounded-lg border bg-card p-6">
                <p className="font-medium mb-2">Something went wrong in the chat.</p>
                <p className="text-sm text-muted-foreground mb-4">{e.message}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={reset}>Retry</Button>
                  <Button variant="outline" onClick={handleClearMessages}>Reset Conversation</Button>
                </div>
              </div>
            </div>
          )}>
            <UnifiedChatInterface
              messages={messages}
              isLoading={isLoading}
              sessionId={sessionId}
              mode="full"
              onSendMessage={handleSendMessage}
              onClearMessages={handleClearMessages}
              onToolAction={handleToolAction}
              className={!consentAllowed ? "pointer-events-none opacity-50" : ""}
              stickyHeaderSlot={undefined}
              composerTopSlot={
                <div className="flex items-center justify-end gap-2 w-full">
                  <SuggestedActions 
                    sessionId={sessionId} 
                    stage={stage as any} 
                    onRun={handleSuggestionRun}
                    mode="static"
                  />
                </div>
              }
            />
          </ErrorBoundary>

          {/* Voice Overlay */}
          <VoiceOverlay
            open={openVoice}
            sessionId={sessionId}
            onCancel={() => setOpenVoice(false)}
            onAccept={(text: string) => {
              setOpenVoice(false)
              if (text && text.trim()) {
                setInput(text)
                handleSendMessage(text)
              }
            }}
          />

          {/* Error Handler */}
          {error && (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4">
              <div className="max-w-md w-full">
                <ErrorHandler 
                  error={error} 
                  onRetry={() => setError(null)} 
                  onReset={() => {
                    setError(null)
                    handleClearMessages()
                  }} 
                  context="chat" 
                />
              </div>
            </div>
          )}

          {/* Lead Progress Indicator */}
          <div className="pointer-events-none fixed right-4 top-24 z-50 hidden md:block">
            <div className="pointer-events-auto">
              <LeadProgressIndicator 
                currentStage={stage} 
                leadData={lead} 
                variant="rail" 
              />
            </div>
          </div>

          {/* Suggested Actions moved into sticky header of message list via stickyHeaderSlot */}

          {/* Finish & Email Button stays floating; if you want it sticky too, move it into stickyHeaderSlot */}
        </div>
      </PageShell>
    </DemoSessionProvider>
  )
}
