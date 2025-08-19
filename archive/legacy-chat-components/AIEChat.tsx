"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { Video, Send, Download, Calculator, Monitor, Camera } from '@/lib/icon-mapping'
import { MessageCircle, Maximize2, MoreHorizontal } from 'lucide-react'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageAvatar } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
// Removed inline code block preview; use canvas 'code' when needed
import { PromptInput, PromptInputToolbar, PromptInputTools, PromptInputTextarea, PromptInputSubmit, PromptInputButton } from '@/components/ai-elements/prompt-input'
// Suggestions replaced by coach chips
import { ToolMenu } from '@/components/chat/ToolMenu'
import VoiceOverlay from '@/components/chat/VoiceOverlay'
import { ErrorHandler } from '@/components/chat/ErrorHandler'
import { LeadProgressIndicator } from '@/components/chat/LeadProgressIndicator'
import { ConversationStage } from '@/lib/lead-manager'
// Canvas rendered globally via orchestrator
import { CanvasOrchestrator } from '@/components/chat/CanvasOrchestrator'
import { ToolLauncher } from '@/components/chat/ToolLauncher'
import { useCanvas } from '@/components/providers/canvas-provider'
// Tool UIs are rendered via CanvasOrchestrator
import useChat from '@/hooks/chat/useChat'
import { useConversationalIntelligence } from '@/hooks/useConversationalIntelligence'
import { isFlagEnabled } from '@/lib/flags'
import CitationDisplay from '@/components/chat/CitationDisplay'
import SuggestedActions from '@/components/intelligence/SuggestedActions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useMeeting } from '@/components/providers/meeting-provider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function AIEChat({ mode = 'full' as 'full' | 'dock', onOpenVoice }: { mode?: 'full' | 'dock', onOpenVoice?: () => void }) {
  const isDock = mode === 'dock'
  const meeting = useMeeting()
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    const sid = window.localStorage.getItem('intelligence-session-id')
    return sid || null
  })
  const [openVoice, setOpenVoice] = useState(false)
  const liveEnabled = process.env.NEXT_PUBLIC_LIVE_ENABLED !== 'false'
  const [error, setError] = useState<Error | null>(null)
  const { openCanvas } = useCanvas()
  const [isVoiceMock, setIsVoiceMock] = useState(false)
  // Consent gate
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentAllowed, setConsentAllowed] = useState(false)
  const [consentDenied, setConsentDenied] = useState(false)
  const [consentEmail, setConsentEmail] = useState('')
  const [consentCompany, setConsentCompany] = useState('')

  // Persist session id to single source of truth only
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionId && window.localStorage.getItem('intelligence-session-id') !== sessionId) {
      window.localStorage.setItem('intelligence-session-id', sessionId)
    }
  }, [sessionId])

  // Conversational Intelligence
  const { 
    context, 
    isLoading: contextLoading, 
    fetchContextFromLocalSession, 
    clearContextCache, 
    generatePersonalizedGreeting 
  } = useConversationalIntelligence()

  const leadContextData = useMemo(() => {
    if (!context) return undefined as undefined | any
    return {
      name: context?.person?.fullName || context?.lead?.name,
      email: context?.lead?.email,
      company: context?.company?.name,
      role: context?.role,
      industry: context?.company?.industry,
    }
  }, [context])

  const { messages, input, setInput, isLoading, error: chatError, sendMessage, handleSubmit, handleInputChange, clearMessages, addMessage } = useChat({
    data: { sessionId: sessionId ?? undefined, enableLeadGeneration: false, leadContext: leadContextData },
    onError: (e) => setError(e),
  })

  const [stage, setStage] = useState<ConversationStage>(ConversationStage.GREETING)
  const [lead, setLead] = useState<{ name?: string; email?: string; company?: string } | undefined>()
  const [logs, setLogs] = useState<Array<{ id: string; ts: string; level: 'info' | 'warn' | 'error'; text: string }>>([])
  const STORAGE_KEY = `fbc:chat-logs:${sessionId}`

  function addLog(text: string, level: 'info' | 'warn' | 'error' = 'info') {
    setLogs(prev => {
      const next = [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ts: new Date().toLocaleTimeString(), level, text }]
      return next.length > 1000 ? next.slice(next.length - 1000) : next
    })
  }

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setLogs(parsed)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY])

  useEffect(() => {
    // Dev/test hook: detect voiceMock=1 and auto-open overlay
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const vm = params.get('voiceMock') === '1'
        setIsVoiceMock(vm)
        if (vm) setOpenVoice(true)
      }
    } catch {}

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
      }
    } catch {}
  }, [logs, STORAGE_KEY])

  // Check consent on mount and restore existing session
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/consent', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          if (j.allow) {
            setConsentAllowed(true)
            // If consent was already given, check for existing session ID
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

  // If user arrived from education, prefill a context card once
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('education') === '1') {
        const text = window.localStorage.getItem('fbc:education:last')
        if (text && text.trim()) {
          setInput(text)
          addLog('education → context card prefilled')
          window.localStorage.removeItem('fbc:education:last')
        }
      }
        const videoUrl = params.get('video') || window.localStorage.getItem('fbc:video:last')
        if (videoUrl) {
          openCanvas('video', { videoUrl })
        addLog(`video param → open video2app: ${videoUrl}`)
        window.localStorage.removeItem('fbc:video:last')
      }
      if (params.get('news') === '1') {
        const text = window.localStorage.getItem('fbc:news:last')
        if (text && text.trim()) {
          setInput(text)
          addLog('news → context card prefilled')
          window.localStorage.removeItem('fbc:news:last')
        }
      }
    } catch {}
  }, [])

  async function handleAllowConsent() {
    try {
      // Step 1: Record consent
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: consentEmail, companyUrl: consentCompany, policyVersion: 'v1' }),
      })
      if (!res.ok) throw new Error('consent failed')
      
      // Step 2: Initialize intelligence session
      const sessionInitRes = await fetch('/api/intelligence/session-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: sessionId || undefined,
          email: consentEmail, 
          name: consentEmail.split('@')[0], // Extract name from email
          companyUrl: consentCompany 
        }),
      })
      
      if (sessionInitRes.ok) {
        const sessionData = await sessionInitRes.json()
        // Store sessionId for future use
        if (sessionData.sessionId) {
          localStorage.setItem('intelligence-session-id', sessionData.sessionId)
          setSessionId(sessionData.sessionId)
          addLog(`intelligence: session initialized - ${sessionData.sessionId}`)
          
          // Clear cache and force fresh fetch since we know context changed
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

  // console download/filters removed with global orchestrator consolidation

  // filtered logs and counts no longer needed in component; kept in history if needed

  function detectYouTubeURL(text: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = text.match(regex)
    return match ? match[0] : null
  }

  
  const [coachNext, setCoachNext] = useState<string | null>(null)
  const [coachAll, setCoachAll] = useState<string[]>([])

  const [showRoiForm, setShowRoiForm] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const lastContextRefreshRef = useRef(0)
  const intentPostedRef = useRef(false)

  function emitUsed(name: string) {
    try { window.dispatchEvent(new CustomEvent('chat-capability-used', { detail: { name } })) } catch {}

    // Throttle context refreshes to at most once every 1.5s
    const now = Date.now()
    if (now - lastContextRefreshRef.current >= 1500) {
      lastContextRefreshRef.current = now
      clearContextCache()
      fetchContextFromLocalSession({ force: true })
    }
  }

  // Post intent on first user message
  useEffect(() => {
    if (!consentAllowed || !sessionId) return
    // Reset guard when session changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  useEffect(() => {
    if (!consentAllowed || !sessionId) return
    const lastUser = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUser) return
    if (intentPostedRef.current) return
    ;(async () => {
      try {
        const res = await fetch('/api/intelligence/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userMessage: lastUser.content })
        })
        if (res.ok) {
          const j = await res.json()
          const out = j?.output || j
          addLog(`intent: ${out.type} (${Math.round((out.confidence || 0) * 100)}%)`)
        }
      } catch {}
      intentPostedRef.current = true
    })()
  // Only react to messages length to catch the first send
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, consentAllowed, sessionId])

  const [finishOpenSig, setFinishOpenSig] = useState(0)

  async function handleSuggestionRun(s: { id?: string; capability?: string; label: string }) {
    const cap = s.capability
    if (!cap) return
    // Fast-lane: Finish & Email (generate + email, no canvas)
    if (s.id === 'finish' && cap === 'exportPdf') {
      // Open the Send Summary dialog instead of prompt
      try { window.dispatchEvent(new CustomEvent('open-finish-email')) } catch {}
      return
    }
    switch (cap) {
      case 'search':
        setSearchOpen(true)
        setSearchQuery('')
        break
      case 'roi':
        addLog('suggestion → ROI')
        setCoachNext('roi')
        emitUsed('roi')
        break
      case 'screenShare':
        addLog('suggestion → screen share')
        openCanvas('screen')
        emitUsed('screenShare')
        break
      case 'translate':
        addLog('suggestion → translate')
        emitUsed('translate')
        break
      case 'meeting':
        addLog('suggestion → schedule meeting')
        try { meeting.open() } catch {}
        emitUsed('meeting')
        break
      case 'doc':
        addLog('suggestion → document analysis')
        emitUsed('doc')
        break
      case 'image':
        addLog('suggestion → image analysis')
        openCanvas('webcam')
        emitUsed('image')
        break
      case 'video2app':
        addLog('suggestion → video2app')
        openCanvas('video')
        emitUsed('video2app')
        break
      case 'exportPdf':
        addLog('suggestion → export PDF')
        openCanvas('pdf')
        emitUsed('exportPdf')
        break
      default:
        addLog(`suggestion → ${cap}`)
        emitUsed(cap)
    }
  }

  const uiMessages = useMemo(() => messages.map(m => ({
    id: m.id,
    role: m.role,
    text: m.content,
    sources: m.sources,
    citations: m.citations
  })), [messages])

  useEffect(() => {
    const onServerEvent = (e: Event) => {
      const ce = e as CustomEvent<any>
      if (ce.detail?.conversationStage) {
        setStage(ce.detail.conversationStage as ConversationStage)
        addLog(`stage → ${ce.detail.conversationStage}`)
      }
      if (ce.detail?.leadData) {
        setLead({
          name: ce.detail.leadData.name,
          email: ce.detail.leadData.email,
          company: ce.detail.leadData.company,
        })
        addLog(`lead → ${[ce.detail.leadData.name, ce.detail.leadData.email, ce.detail.leadData.company].filter(Boolean).join(' · ')}`)
      }
    }
    const onCoach = (e: Event) => {
      const ce = e as CustomEvent<any>
      if (ce.detail?.nextBest) {
        setCoachNext(ce.detail.nextBest)
        setCoachAll(Array.isArray(ce.detail.suggestions) ? ce.detail.suggestions : [ce.detail.nextBest])
        addLog(`coach: try → ${ce.detail.nextBest}`)
      }
    }
    const onUsed = (e: Event) => {
      const ce = e as CustomEvent<any>
      if (ce.detail?.name) {
        // Capability usage is now tracked server-side via context
        console.info(`Capability used: ${ce.detail.name}`)
      }
    }
    window.addEventListener('chat-server-event', onServerEvent as EventListener)
    window.addEventListener('chat-coach-suggestion', onCoach as EventListener)
    window.addEventListener('chat-capability-used', onUsed as EventListener)
    return () => {
      window.removeEventListener('chat-server-event', onServerEvent as EventListener)
      window.removeEventListener('chat-coach-suggestion', onCoach as EventListener)
      window.removeEventListener('chat-capability-used', onUsed as EventListener)
    }
  }, [])

  return (
    <TooltipProvider>
      <div className={cn(isDock ? 'h-full flex flex-col overflow-hidden' : 'fixed inset-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-background')} data-chat-root>
        {!isDock && (
        <header className="flex items-center justify-between border-b bg-background/50 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <FbcIcon className="h-6 w-6" />
            <div>
              <h1 className="text-lg font-semibold leading-tight tracking-tight">F.B/c — Chat</h1>
               <p className="text-xs text-muted-foreground">AI Elements + grounded streaming</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => clearMessages()}>Reset</Button>
            {isVoiceMock && (
              <Button
                data-test="open-voice"
                aria-label="Open voice overlay"
                onClick={() => (onOpenVoice ? onOpenVoice() : setOpenVoice(true))}
              >
                Voice (test)
              </Button>
            )}
          </div>
        </header>
        )}

        {/* Consent Hard Gate */}
        {consentChecked && !consentAllowed && !consentDenied && (
          <div className={cn("grid place-items-center p-4", isDock ? "" : "absolute inset-0 z-50 bg-background/95") }>
            <div className="w-full max-w-lg rounded-xl border bg-card p-4 shadow">
              <h2 className="text-base font-semibold">Personalize this chat using your public company info?</h2>
              <p className="mt-1 text-sm text-muted-foreground">We’ll fetch from your company site and LinkedIn to ground results with citations. See our <a href="/privacy" className="underline">Privacy & Terms</a>.</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <input
                  type="email"
                  placeholder="Work email (name@company.com)"
                  value={consentEmail}
                  onChange={(e) => setConsentEmail(e.target.value)}
                  className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
                <input
                  type="text"
                  placeholder="Company website (optional)"
                  value={consentCompany}
                  onChange={(e) => setConsentCompany(e.target.value)}
                  className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={handleDenyConsent}>No thanks</Button>
                <Button onClick={handleAllowConsent}>Allow</Button>
              </div>
            </div>
          </div>
        )}

        {consentDenied && (
          <div className={cn("grid place-items-center p-4", isDock ? "" : "absolute inset-0 z-50 bg-background/95") }>
            <div className="w-full max-w-md rounded-xl border bg-card p-4 text-center">
              <h2 className="text-base font-semibold">Consent is required to continue</h2>
              <p className="mt-1 text-sm text-muted-foreground">We use public company info with citations to personalize results. Review our <a href="/privacy" className="underline">policy</a> and start again anytime.</p>
            </div>
          </div>
        )}

        <div className="flex flex-1 min-h-0 flex-col">
          <div className={cn('h-full', isDock && 'relative')}>
            {isDock && (
              <button
                aria-label="Expand chat"
                onClick={() => { try { window.location.href = '/chat' } catch {} }}
                className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
            <Conversation className="h-full" role="log" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
              <ConversationContent className={cn(
                isDock
                  ? "mx-auto w-full max-w-3xl space-y-3 p-4 pb-4 bg-card border border-border/60 rounded-lg"
                  : "w-full max-w-none space-y-4 p-4 md:p-6 pb-28 md:pb-32"
              )}>
              {/* Personalized greeting when context is loaded and no messages yet */}
              {context && uiMessages.length === 0 && !isLoading && (
                <Message from="assistant">
                  <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-card/80 shadow-sm">
                    <FbcIcon className="h-4 w-4" />
                  </div>
                  <MessageContent>
                    <Response>{generatePersonalizedGreeting(context)}</Response>
                  </MessageContent>
                </Message>
              )}
              
              {/* Empty state for dock mode when no messages */}
              {!context && uiMessages.length === 0 && !isLoading && isDock && (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div className="max-w-sm">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-60" />
                    <p className="text-sm">Ready to chat with F.B/c AI</p>
                    <p className="text-xs opacity-70 mt-1">Type a message below to get started</p>
                    {!consentAllowed && (
                      <p className="text-xs opacity-70 mt-2">Composer is disabled until consent is granted.</p>
                    )}
                  </div>
                </div>
              )}
              
              <ol role="list" className="space-y-3">
              {uiMessages.map((m, idx) => (
                <li key={m.id} role="article" aria-roledescription="message" aria-label={`${m.role} message`}>
                <Message from={m.role}>
                  {m.role === 'assistant' ? (
                    <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-card/80 shadow-sm">
                      <FbcIcon className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-[hsl(var(--accent))/0.6]">
                      <span className="absolute -bottom-0.5 -right-0.5 inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))] shadow-[0_0_8px_hsl(var(--accent)/0.7)]" />
                    </div>
                  )}
                  <MessageContent>
                    {m.role === 'assistant' && (
                      <Reasoning defaultOpen={false} isStreaming={isLoading} duration={3}>
                        <ReasoningTrigger>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <p>Thinking…</p>
                  {(process.env.NEXT_PUBLIC_PERSONA === 'farzad' || process.env.NEXT_PUBLIC_LEAD_MODE === 'aggressive') && (
                    <p className="text-xs text-muted-foreground">F.B/c AI — Farzad Bayat, Consulting</p>
                  )}
                          </div>
                        </ReasoningTrigger>
                        <ReasoningContent>Model is processing your last input.</ReasoningContent>
                      </Reasoning>
                    )}

                    {!!m.text && <Response>{m.text}</Response>}
                    {/* Brand icon near assistant message while streaming */}
                    {/* Removed brand chip under assistant output while streaming */}

                    {/* Citations from grounded search (prefer explicit citations, fallback to sources) */}
                    <CitationDisplay citations={m.citations ?? (m.sources?.map((s: any) => ({ uri: s.url, title: s.title })) || [])} />

                    {!!m.sources?.length && (
                      <div className="mt-2">
                        <Sources>
                          <SourcesTrigger count={m.sources.length} />
                          <SourcesContent>
                            {m.sources.map((s, i) => (
                              <Source key={`${m.id}-src-${i}`} href={s.url} title={s.title || s.url} />
                            ))}
                          </SourcesContent>
                        </Sources>
                      </div>
                    )}

                    {/* Guided ROI form (feature-flagged) */}
                    {isFlagEnabled('roi_inline_form') && m.role === 'assistant' && idx === uiMessages.length - 1 && coachNext === 'roi' && (
                      <div className="mt-3 rounded-xl border bg-card/60 p-3">
                        <p className="mb-2 text-sm text-muted-foreground">Quick ROI inputs (you can adjust later):</p>
                        <form
                          className="grid grid-cols-1 gap-2 md:grid-cols-3"
                          onSubmit={(e) => {
                            e.preventDefault()
                            const fd = new FormData(e.currentTarget as HTMLFormElement)
                            const hours = Number(fd.get('hours') || 0)
                            const cost = Number(fd.get('cost') || 0)
                            const auto = Number(fd.get('auto') || 0)
                            const annualHours = Math.round(hours * 52)
                            const savings = Math.round(annualHours * (auto / 100) * cost)
                            const summary = `ROI quick estimate:\n- Weekly Hours: ${hours}\n- Hourly Cost: $${cost}\n- Automation: ${auto}%\n\nEstimated annual savings: ~$${savings.toLocaleString()}.`
                            emitUsed('roi')
                            sendMessage(summary)
                          }}
                        >
                          <input name="hours" type="number" min="0" step="1" placeholder="Weekly hours" className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" required />
                          <input name="cost" type="number" min="0" step="1" placeholder="Hourly cost ($)" className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" required />
                          <input name="auto" type="number" min="0" max="100" step="5" placeholder="Automation %" className="rounded-md border border-border/40 bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" required />
                          <div className="md:col-span-3 mt-2 flex justify-end gap-2">
                            <Button type="submit" size="sm">Estimate</Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </MessageContent>
                </Message>
                </li>
              ))}
              </ol>

              {/* demo code block removed; use Canvas 'code' instead */}
            </ConversationContent>
            <ConversationScrollButton className="bg-background/80 backdrop-blur z-50" />
          </Conversation>
          </div>

          <div className={cn(
            isDock
              ? 'sticky bottom-0 z-50 mx-auto w-full max-w-3xl px-4 pb-4 pt-2'
              : 'sticky bottom-0 z-50 w-full px-6 pb-4 pt-2',
            isDock ? 'bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50' : 'bg-gradient-to-t from-background via-background/90 to-transparent'
          )}>
            {/* Phase 2: Suggested actions */}
            <SuggestedActions sessionId={sessionId} stage={stage as any} onRun={handleSuggestionRun} />
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputToolbar>
                <PromptInputTools>
                  <ToolMenu
                    onUploadDocument={() => { addLog('tool: upload document'); emitUsed('doc'); }}
                    onUploadImage={() => { addLog('tool: upload image'); emitUsed('image'); }}
                    onWebcam={() => { openCanvas('webcam'); addLog('canvas: open webcam'); emitUsed('webcam'); }}
                    onScreenShare={() => { openCanvas('screen'); addLog('canvas: open screen share'); emitUsed('screenShare'); }}
                    onROI={() => { addLog('tool: ROI calculator'); emitUsed('roi'); }}
                    onVideoToApp={() => { openCanvas('video'); addLog('canvas: open video2app'); emitUsed('video2app'); }}
                  />
                  {/* Context awareness indicator next to plus */}
                  <Badge variant="secondary" className="ml-2 text-[11px]" aria-hidden>Context Aware</Badge>
                </PromptInputTools>
                {/* Far-right actions entry-point */}
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button aria-label="More actions" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-accent/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { clearMessages(); addLog('chat: cleared') }}>Clear chat</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { try { window.location.href = '/chat' } catch {} }}>Expand</DropdownMenuItem>
                      {liveEnabled && (
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { setOpenVoice(true); addLog('voice: open overlay') }}>Voice</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </PromptInputToolbar>
                <PromptInputTextarea
                  placeholder="Message F.B/c… (paste a YouTube URL to open Video → App)"
                  className="min-h-[64px] md:min-h-[72px] text-base md:text-sm"
                  value={input}
                  onChange={(e) => {
                    handleInputChange(e as any)
                    const url = detectYouTubeURL(e.target.value)
                    if (url) {
                      openCanvas('video', { videoUrl: url })
                      addLog(`detected youtube url → open video2app: ${url}`)
                      emitUsed('video2app')
                    }
                  }}
                  disabled={!consentAllowed}
                />
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-2">
                   {coachNext === 'roi' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → roi'); openCanvas('roi'); emitUsed('roi'); }} aria-label="Open ROI calculator">
                          <Calculator className="h-3.5 w-3.5" /> ROI Calculator
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Estimate savings and payback period</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'video' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → video'); openCanvas('video'); emitUsed('video2app'); }} aria-label="Open Video to App">
                          <Video className="h-3.5 w-3.5" /> Video → App
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Turn a YouTube link into an app blueprint</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'screen' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → screen'); openCanvas('screen'); emitUsed('screenShare'); }} aria-label="Share screen">
                          <Monitor className="h-3.5 w-3.5" /> Share Screen
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Get live feedback on your current flow</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'image' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → image'); openCanvas('webcam'); emitUsed('image'); }} aria-label="Analyze an image or screenshot">
                          <Camera className="h-3.5 w-3.5" /> Analyze Image
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Upload or capture a screenshot to analyze</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'webpreview' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → webpreview'); openCanvas('webpreview'); emitUsed('webpreview'); }} aria-label="Open web preview">
                          <span className="inline-block h-3.5 w-3.5">🌐</span> Web Preview
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Preview and inspect a URL inside the canvas</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FinishAndEmailButton sessionId={sessionId} addLog={addLog} />
                  {/* Minimal icon buttons (no extra chrome) */}
                  {null}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button aria-label="Video → App" className="text-muted-foreground hover:text-foreground" onClick={() => { openCanvas('video'); addLog('canvas: open video2app (quick)'); emitUsed('video2app') }}>
                        <Video className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Video → App</TooltipContent>
                  </Tooltip>
                  {liveEnabled && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button aria-label="Voice" className="text-muted-foreground hover:text-foreground" onClick={() => { setOpenVoice(true); addLog('voice: open overlay') }}>
                          <FbcIcon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Voice</TooltipContent>
                    </Tooltip>
                  )}
                  <PromptInputSubmit status={isLoading ? 'submitted' : undefined} className="rounded-full" />
                </div>
              </div>
            </PromptInput>
          </div>

          {liveEnabled && !onOpenVoice && (
            <VoiceOverlay
              open={openVoice}
              sessionId={sessionId}
              onCancel={() => { setOpenVoice(false); addLog('voice: cancel'); }}
              onAccept={(t: string) => { setOpenVoice(false); addLog('voice: accept'); if (t && t.trim()) setInput(t) }}
            />
          )}
          {error || chatError ? (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4">
              <div className="max-w-md w-full">
                <ErrorHandler error={error || chatError!} onRetry={() => setError(null)} onReset={() => setError(null)} context="chat" />
              </div>
            </div>
          ) : null}

          {!isDock && (
            <div className="pointer-events-none fixed right-4 top-24 z-50 hidden md:block">
              <div className="pointer-events-auto">
                <LeadProgressIndicator currentStage={stage} leadData={lead} variant="rail" />
              </div>
            </div>
          )}
        </div>

        {/* Global canvas overlay */}
        <CanvasOrchestrator />
        {/* Mobile tool launcher */}
        <div className="md:hidden">
          <ToolLauncher />
        </div>
      </div>
    </TooltipProvider>
  )
}

function FinishAndEmailButton({ sessionId, addLog }: { sessionId: string | null, addLog: (msg: string, level?: any) => void }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('contact@farzadbayat.com')
  const [isSending, setIsSending] = useState(false)
  return (
    <>
      <button
        className="hidden md:inline-flex items-center gap-1 rounded-full border border-border/50 bg-card/60 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
      >
        Finish & Email
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send summary via email</DialogTitle>
            <DialogDescription>We’ll generate the PDF and email it to the recipient.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const toEmail = email.trim()
              if (!toEmail) return
              setIsSending(true)
              addLog(`finish: generate + email summary → ${toEmail}`)
              try {
                const gen = await fetch('/api/export-summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
                if (!gen.ok) throw new Error(`export failed: ${gen.status}`)
                const res = await fetch('/api/send-pdf-summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, toEmail }) })
                if (!res.ok) throw new Error(`send failed: ${res.status}`)
                addLog('finish: emailed summary')
                setOpen(false)
              } catch (e: any) {
                addLog(`finish: email error → ${e?.message || 'unknown'}`, 'error')
              } finally {
                setIsSending(false)
              }
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="finish-email">Recipient email</Label>
              <Input id="finish-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className={cn('h-9 rounded-md border px-3 text-sm', 'border-border/50 bg-card/60 text-muted-foreground hover:text-foreground')} onClick={() => setOpen(false)} disabled={isSending}>Cancel</button>
              <button type="submit" className={cn('h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:opacity-90', isSending && 'opacity-70')} disabled={isSending}>
                {isSending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AIEChat


