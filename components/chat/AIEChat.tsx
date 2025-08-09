"use client"

import { useEffect, useMemo, useState } from 'react'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { FbcIcon } from '@/components/ui/fbc-icon'
import { Video, Send, Download, Calculator, Monitor, Camera } from '@/lib/icon-mapping'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageAvatar } from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai-elements/reasoning'
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source'
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block'
import { PromptInput, PromptInputToolbar, PromptInputTools, PromptInputTextarea, PromptInputSubmit, PromptInputButton } from '@/components/ai-elements/prompt-input'
// Suggestions replaced by coach chips
import { ToolMenu } from '@/components/chat/ToolMenu'
import VoiceOverlay from '@/components/chat/VoiceOverlay'
import { ErrorHandler } from '@/components/chat/ErrorHandler'
import { LeadProgressIndicator } from '@/components/chat/LeadProgressIndicator'
import { ConversationStage } from '@/lib/lead-manager'
import { CanvasWorkspace } from '@/components/chat/CanvasWorkspace'
import { WebPreview, WebPreviewNavigation, WebPreviewNavigationButton, WebPreviewUrl, WebPreviewBody, WebPreviewConsole } from '@/components/ai-elements/web-preview'
import { ScreenShare } from '@/components/chat/tools/ScreenShare/ScreenShare'
import { WebcamCapture } from '@/components/chat/tools/WebcamCapture/WebcamCapture'
import { VideoToApp } from '@/components/chat/tools/VideoToApp/VideoToApp'
import useChat from '@/hooks/chat/useChat'
import { isFlagEnabled } from '@/lib/flags'

export function AIEChat() {
  const [sessionId] = useState(() => (typeof window !== 'undefined' ? (window.localStorage.getItem('demo-session-id') || 'default') : 'default'))
  const [openVoice, setOpenVoice] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [canvas, setCanvas] = useState<{ type: 'webpreview' | 'screen' | 'webcam' | 'video' | 'pdf'; url?: string } | null>(null)
  const [isVoiceMock, setIsVoiceMock] = useState(false)
  // Consent gate
  const [consentChecked, setConsentChecked] = useState(false)
  const [consentAllowed, setConsentAllowed] = useState(false)
  const [consentDenied, setConsentDenied] = useState(false)
  const [consentEmail, setConsentEmail] = useState('')
  const [consentCompany, setConsentCompany] = useState('')

  const { messages, input, setInput, isLoading, error: chatError, sendMessage, handleSubmit, handleInputChange, clearMessages } = useChat({
    data: { sessionId },
    onError: (e) => setError(e),
  })

  const [stage, setStage] = useState<ConversationStage>(ConversationStage.GREETING)
  const [lead, setLead] = useState<{ name?: string; email?: string; company?: string } | undefined>()
  const [logs, setLogs] = useState<Array<{ id: string; ts: string; level: 'info' | 'warn' | 'error'; text: string }>>([])
  const [filterLevels, setFilterLevels] = useState<{ info: boolean; warn: boolean; error: boolean }>({ info: true, warn: true, error: true })
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

  // Check consent on mount
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/consent', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          if (j.allow) setConsentAllowed(true)
        }
      } catch {}
      setConsentChecked(true)
    })()
  }, [])

  async function handleAllowConsent() {
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: consentEmail, companyUrl: consentCompany, policyVersion: 'v1' }),
      })
      if (!res.ok) throw new Error('consent failed')
      setConsentAllowed(true)
      setConsentDenied(false)
    } catch {
      alert('Unable to record consent. Please check your email/company and try again.')
    }
  }

  function handleDenyConsent() {
    setConsentDenied(true)
    setConsentAllowed(false)
  }

  function downloadLogs() {
    try {
      const blob = new Blob([JSON.stringify({ sessionId, logs }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fbc-console-${sessionId}-${new Date().toISOString().slice(0,19)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addLog('console: downloaded logs')
    } catch {
      addLog('console: failed to download', 'error')
    }
  }

  const filteredLogs = useMemo(() => logs.filter(l => (l.level === 'info' && filterLevels.info) || (l.level === 'warn' && filterLevels.warn) || (l.level === 'error' && filterLevels.error)), [logs, filterLevels])
  const counts = useMemo(() => ({ info: logs.filter(l => l.level === 'info').length, warn: logs.filter(l => l.level === 'warn').length, error: logs.filter(l => l.level === 'error').length }), [logs])

  function detectYouTubeURL(text: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = text.match(regex)
    return match ? match[0] : null
  }

  const [canvasInput, setCanvasInput] = useState('')
  const [coachNext, setCoachNext] = useState<string | null>(null)
  const [coachAll, setCoachAll] = useState<string[]>([])
  const [usedCaps, setUsedCaps] = useState<Set<string>>(new Set())
  const [showRoiForm, setShowRoiForm] = useState(false)

  function emitUsed(name: string) {
    try { window.dispatchEvent(new CustomEvent('chat-capability-used', { detail: { name } })) } catch {}
    setUsedCaps(prev => new Set(prev).add(name))
  }

  const uiMessages = useMemo(() => messages.map(m => ({
    id: m.id,
    role: m.role,
    text: m.content,
    sources: m.sources
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
      if (ce.detail?.name) setUsedCaps(prev => new Set(prev).add(String(ce.detail.name)))
    }
    window.addEventListener('chat-server-event', onServerEvent as EventListener)
    window.addEventListener('chat-coach-suggestion', onCoach as EventListener)
    window.addEventListener('chat-capability-used', onUsed as EventListener)
    return () => window.removeEventListener('chat-server-event', onServerEvent as EventListener)
  }, [])

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-40 flex h-[100dvh] flex-col overflow-hidden bg-background" data-chat-root>
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
                onClick={() => setOpenVoice(true)}
              >
                Voice (test)
              </Button>
            )}
          </div>
        </header>

        {/* Consent Hard Gate */}
        {consentChecked && !consentAllowed && !consentDenied && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-background/95 p-4">
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
          <div className="absolute inset-0 z-50 grid place-items-center bg-background/95 p-4">
            <div className="w-full max-w-md rounded-xl border bg-card p-4 text-center">
              <h2 className="text-base font-semibold">Consent is required to continue</h2>
              <p className="mt-1 text-sm text-muted-foreground">We use public company info with citations to personalize results. Review our <a href="/privacy" className="underline">policy</a> and start again anytime.</p>
            </div>
          </div>
        )}

        <div className="flex flex-1 min-h-0 flex-col">
          <Conversation className="h-full">
            <ConversationContent className="mx-auto w-full max-w-3xl space-y-2 p-4 pb-28 md:pb-32">
              {uiMessages.map((m, idx) => (
                <Message key={m.id} from={m.role}>
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
                          </div>
                        </ReasoningTrigger>
                        <ReasoningContent>Model is processing your last input.</ReasoningContent>
                      </Reasoning>
                    )}

                    {!!m.text && <Response>{m.text}</Response>}
                    {/* Brand icon near assistant message while streaming */}
                    {/* Removed brand chip under assistant output while streaming */}

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
              ))}

              {false && (
                <Message from="assistant">
                  <MessageContent>
                    <CodeBlock code={`console.log('hello')`} language="ts">
                      <CodeBlockCopyButton />
                    </CodeBlock>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton className="bg-background/80 backdrop-blur z-50" />
          </Conversation>

          <div className="sticky bottom-0 z-50 mx-auto w-full max-w-3xl bg-gradient-to-t from-background via-background/90 to-transparent px-4 pb-4 pt-2">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputToolbar>
                <PromptInputTools>
                  <ToolMenu
                    onUploadDocument={() => { addLog('tool: upload document'); emitUsed('doc'); }}
                    onUploadImage={() => { addLog('tool: upload image'); emitUsed('image'); }}
                    onWebcam={() => { setCanvas({ type: 'webcam' }); addLog('canvas: open webcam'); emitUsed('webcam'); }}
                    onScreenShare={() => { setCanvas({ type: 'screen' }); addLog('canvas: open screen share'); emitUsed('screen'); }}
                    onROI={() => { addLog('tool: ROI calculator'); emitUsed('roi'); }}
                    onVideoToApp={() => { setCanvas({ type: 'video' }); addLog('canvas: open video2app'); emitUsed('video'); }}
                    onPdf={() => { setCanvas({ type: 'pdf' }); addLog('canvas: open pdf summary'); emitUsed('pdf'); }}
                  />
                </PromptInputTools>
              </PromptInputToolbar>
              <PromptInputTextarea
                placeholder="Message F.B/c… (paste a YouTube URL to open Video → App)"
                className="min-h-[64px] md:min-h-[72px] text-base md:text-sm"
                value={input}
                onChange={(e) => {
                  handleInputChange(e as any)
                  const url = detectYouTubeURL(e.target.value)
                  if (url) {
                    setCanvas({ type: 'video', url })
                    addLog(`detected youtube url → open video2app: ${url}`)
                    emitUsed('video')
                  }
                }}
                disabled={!consentAllowed}
              />
              <div className="flex items-center justify-between p-1">
                <div className="flex items-center gap-2">
                  {coachNext === 'roi' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → roi'); setCanvas({ type: 'screen' }); emitUsed('roi'); }} aria-label="Open ROI calculator">
                          <Calculator className="h-3.5 w-3.5" /> ROI Calculator
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Estimate savings and payback period</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'video' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → video'); setCanvas({ type: 'video' }); emitUsed('video'); }} aria-label="Open Video to App">
                          <Video className="h-3.5 w-3.5" /> Video → App
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Turn a YouTube link into an app blueprint</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'screen' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → screen'); setCanvas({ type: 'screen' }); emitUsed('screen'); }} aria-label="Share screen">
                          <Monitor className="h-3.5 w-3.5" /> Share Screen
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Get live feedback on your current flow</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'image' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → image'); setCanvas({ type: 'webcam' }); emitUsed('image'); }} aria-label="Analyze an image or screenshot">
                          <Camera className="h-3.5 w-3.5" /> Analyze Image
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Upload or capture a screenshot to analyze</TooltipContent>
                    </Tooltip>
                  )}
                  {coachNext === 'webpreview' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button data-coach-cta onClick={() => { addLog('coach → webpreview'); setCanvas({ type: 'webpreview', url: '' }); emitUsed('webpreview'); }} aria-label="Open web preview">
                          <span className="inline-block h-3.5 w-3.5">🌐</span> Web Preview
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Preview and inspect a URL inside the canvas</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress chip */}
                  <div className="hidden md:inline-flex items-center gap-1 rounded-full border border-border/50 bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    {usedCaps.size}/16 explored
                  </div>
                  {/* Minimal icon buttons (no extra chrome) */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button aria-label="PDF Summary" className="text-muted-foreground hover:text-foreground" onClick={() => { setCanvas({ type: 'pdf' }); addLog('canvas: open pdf (quick)'); emitUsed('pdf') }}>
                        <Download className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>PDF Summary</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button aria-label="Video → App" className="text-muted-foreground hover:text-foreground" onClick={() => { setCanvas({ type: 'video' }); addLog('canvas: open video2app (quick)'); emitUsed('video') }}>
                        <Video className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Video → App</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button aria-label="Voice" className="text-muted-foreground hover:text-foreground" onClick={() => { setOpenVoice(true); addLog('voice: open overlay'); emitUsed('voice') }}>
                        <FbcIcon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Voice</TooltipContent>
                  </Tooltip>
                  <PromptInputSubmit status={!input || !consentAllowed ? 'submitted' : undefined} className="rounded-full" />
                </div>
              </div>
            </PromptInput>
          </div>

          <VoiceOverlay open={openVoice} onCancel={() => { setOpenVoice(false); addLog('voice: cancel'); }} onAccept={() => { setOpenVoice(false); addLog('voice: accept'); }} />
          {error || chatError ? (
            <div className="fixed inset-0 z-[60] grid place-items-center bg-background/70 backdrop-blur-sm p-4">
              <div className="max-w-md w-full">
                <ErrorHandler error={error || chatError!} onRetry={() => setError(null)} onReset={() => setError(null)} context="chat" />
              </div>
            </div>
          ) : null}

          <div className="pointer-events-none fixed right-4 top-24 z-50 hidden md:block">
            <div className="pointer-events-auto">
              <LeadProgressIndicator currentStage={stage} leadData={lead} variant="rail" className="shadow-xl" />
            </div>
          </div>
        </div>

        <CanvasWorkspace
          open={!!canvas}
          title={canvas?.type === 'screen' ? 'Screen Share' : canvas?.type === 'webcam' ? 'Webcam' : canvas?.type === 'video' ? 'Video to App' : 'Web Preview'}
          onClose={() => { setCanvas(null); addLog('canvas: close'); }}
          left={(
            <div>
              <p className="mb-2 text-muted-foreground">Recent messages</p>
              <ul className="space-y-2">
                {uiMessages.slice(-5).map((m) => (
                  <li key={`ctx-${m.id}`} className="rounded-md border bg-card/50 p-2">
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {m.role}
                    </div>
                    <div className="text-xs text-foreground/90 line-clamp-3 break-words">
                      {m.text || ''}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const text = canvasInput.trim()
                    if (!text) return
                    sendMessage(text)
                    addLog(`canvas chat → ${text.slice(0, 80)}`)
                    setCanvasInput('')
                  }}
                  className="rounded-md border bg-card p-2"
                >
                  <textarea
                    className="w-full resize-none rounded-md border border-border/40 bg-background p-2 text-xs outline-none focus:ring-2 focus:ring-accent/20"
                    rows={2}
                    placeholder="Ask about what's on canvas…"
                    value={canvasInput}
                    onChange={(e) => setCanvasInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        const text = canvasInput.trim()
                        if (!text) return
                        sendMessage(text)
                        addLog(`canvas chat → ${text.slice(0, 80)}`)
                        setCanvasInput('')
                      }
                    }}
                  />
                  <div className="mt-2 flex justify-end">
                    <button type="submit" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                      <Send className="h-3.5 w-3.5" /> Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          consoleArea={(
            <div className="flex h-full w-full flex-col">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Console</span>
                  <div className="ml-2 flex items-center gap-2">
                    <button className={`text-xs rounded px-2 py-0.5 border ${filterLevels.info ? 'bg-green-500/10 border-green-500/30 text-green-600' : 'text-muted-foreground border-border'}`} onClick={() => setFilterLevels(f => ({ ...f, info: !f.info }))}>info ({counts.info})</button>
                    <button className={`text-xs rounded px-2 py-0.5 border ${filterLevels.warn ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600' : 'text-muted-foreground border-border'}`} onClick={() => setFilterLevels(f => ({ ...f, warn: !f.warn }))}>warn ({counts.warn})</button>
                    <button className={`text-xs rounded px-2 py-0.5 border ${filterLevels.error ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'text-muted-foreground border-border'}`} onClick={() => setFilterLevels(f => ({ ...f, error: !f.error }))}>error ({counts.error})</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setLogs([])}>Clear</button>
                  <button className="text-xs text-muted-foreground hover:text-foreground" onClick={downloadLogs}>Download</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto rounded border bg-background p-2 font-mono text-[11px] leading-5">
                {filteredLogs.length === 0 ? (
                  <div className="text-muted-foreground">No logs yet…</div>
                ) : (
                  <ul className="space-y-1">
                    {filteredLogs.map(l => (
                      <li key={l.id} className="break-words">
                        <span className="text-muted-foreground">[{l.ts}]</span>{' '}
                        <span className={l.level === 'error' ? 'text-red-600' : l.level === 'warn' ? 'text-yellow-600' : 'text-green-600'}>[{l.level}]</span>{' '}
                        {l.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        >
          {canvas?.type === 'webpreview' && (
            <WebPreview defaultUrl={canvas.url || ''}>
              <WebPreviewNavigation>
                <WebPreviewNavigationButton tooltip="Back" aria-label="Back" onClick={() => addLog('webpreview: back')} />
                <WebPreviewNavigationButton tooltip="Forward" aria-label="Forward" onClick={() => addLog('webpreview: forward')} />
                <WebPreviewUrl />
              </WebPreviewNavigation>
              <WebPreviewBody className="h-full" />
              <WebPreviewConsole />
            </WebPreview>
          )}
          {canvas?.type === 'screen' && (
            <div className="h-full p-3">
              <ScreenShare mode="canvas" onAnalysis={(a) => addLog(`screen: analysis → ${a}`)} onClose={() => { setCanvas(null); addLog('screen: close'); }} />
            </div>
          )}
          {canvas?.type === 'webcam' && (
            <div className="h-full p-3">
              <WebcamCapture mode="canvas" onCapture={() => addLog('webcam: capture')} onClose={() => { setCanvas(null); addLog('webcam: close'); }} onAIAnalysis={(a) => addLog(`webcam: analysis → ${a}`)} />
            </div>
          )}
          {canvas?.type === 'video' && (
            <div className="h-full p-3">
              <VideoToApp mode="canvas" videoUrl={canvas.url} onClose={() => { setCanvas(null); addLog('video2app: close'); }} onAppGenerated={(url) => addLog(`video2app: app generated → ${url}`)} onAnalysisComplete={() => addLog('video2app: analysis complete')} />
            </div>
          )}
          {canvas?.type === 'pdf' && (
            <div className="flex h-full flex-col p-3">
              <div className="mb-2 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={async () => {
                  addLog('pdf: generating')
                  try {
                    const res = await fetch('/api/export-summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
                    if (!res.ok) throw new Error(`export failed: ${res.status}`)
                    const blob = await res.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `FB-c_Summary_${new Date().toISOString().slice(0,10)}.pdf`
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    URL.revokeObjectURL(url)
                    addLog('pdf: downloaded')
                  } catch (e: any) {
                    addLog(`pdf: error → ${e?.message || 'unknown'}`, 'error')
                  }
                }}>Download PDF</Button>
                <Button size="sm" onClick={async () => {
                  const toEmail = prompt('Send to email address:')
                  if (!toEmail) return
                  addLog(`pdf: email send → ${toEmail}`)
                  try {
                    const res = await fetch('/api/send-pdf-summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, toEmail }) })
                    if (!res.ok) throw new Error(`send failed: ${res.status}`)
                    addLog('pdf: email sent')
                  } catch (e: any) {
                    addLog(`pdf: email error → ${e?.message || 'unknown'}`, 'error')
                  }
                }}>Send via Email</Button>
                <Button size="sm" onClick={() => setCanvas(null)}>Close</Button>
              </div>
              <iframe className="h-full w-full rounded border" src={`/api/export-summary?sessionId=${encodeURIComponent(sessionId)}`} />
            </div>
          )}
        </CanvasWorkspace>
      </div>
    </TooltipProvider>
  )
}

export default AIEChat


