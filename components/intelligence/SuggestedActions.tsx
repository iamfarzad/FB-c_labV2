'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { FileText, PhoneCall, Mail, MoreHorizontal } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookCallButton } from '@/components/meeting/BookCallButton'
import type { Suggestion } from '@/types/intelligence'

interface Props {
  sessionId?: string | null
  stage?: 'GREETING' | 'INTENT' | 'QUALIFY' | 'ACTION'
  onRun?: (s: Suggestion) => void
  mode?: 'suggested' | 'static'
}

export function SuggestedActions({ sessionId, stage = 'INTENT', onRun, mode = 'suggested' }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [finishOpen, setFinishOpen] = useState(false)
  const [finishEmail, setFinishEmail] = useState('contact@farzadbayat.com')

  const [refreshTick, setRefreshTick] = useState(0)

  // Refetch when capabilities are used (server updates context)
  useEffect(() => {
    const onUsed = () => setRefreshTick((x) => x + 1)
    try { window.addEventListener('chat-capability-used', onUsed as EventListener) } catch {}
    return () => {
      try { window.removeEventListener('chat-capability-used', onUsed as EventListener) } catch {}
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!sessionId || mode === 'static') return
      setIsLoading(true)
      try {
        const res = await fetch('/api/intelligence/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, stage }),
        })
        if (!res.ok) throw new Error('failed')
        const j = await res.json()
        const list = (j?.output?.suggestions || j?.suggestions || []) as Suggestion[]
        if (!cancelled) setSuggestions(list)
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [sessionId, stage, refreshTick, mode])

  if (!sessionId) return null
  if (mode !== 'static' && isLoading && suggestions.length === 0) return null

  // Only surface PDF-related CTAs as chips; all other tools (search, video2app, etc.)
  // Persona hint: show a playful nudge when persona is farzad
  const personaHint = process.env.NEXT_PUBLIC_PERSONA === 'farzad'
  // should render inline when the AI actually uses them.
  // Ensure we always surface a booking CTA alongside PDF
  const hasMeeting = suggestions.some(s => s?.capability === 'meeting')
  const augmented = hasMeeting
    ? suggestions
    : [...suggestions, { id: 'meeting-static', capability: 'meeting', label: 'Book a Call' } as Suggestion]

  const visible = augmented.filter(s => {
    if (!s) return false
    if (s.capability === 'exportPdf') return true
    if (s.id === 'finish' && s.capability === 'exportPdf') return true
    if (s.capability === 'meeting') return true
    return false
  })
  if (mode !== 'static' && visible.length === 0) return null

  const outlineCtaClasses = "w-full sm:w-auto whitespace-nowrap border-[var(--color-orange-accent)]/30 hover:border-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent)]/10"

  if (mode === 'static') {
    return (
      <div className="mt-2 w-full">
        {/* Desktop/Tablet: full buttons */}
        <div className="hidden sm:flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className={outlineCtaClasses + ' rounded-full h-8 px-3'}
            onClick={async () => {
              try {
                const res = await fetch('/api/export-summary', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId })
                })
                if (!res.ok) throw new Error(String(res.status))
              } catch (e) {
                console.error('Export summary failed', e)
              }
            }}
          >
            <FileText className="mr-2 h-3.5 w-3.5" /> Generate PDF
          </Button>
          <BookCallButton
            size="sm"
            variant="outline"
            className={outlineCtaClasses + ' rounded-full h-8 px-3'}
          >
            <PhoneCall className="mr-2 h-3.5 w-3.5" /> Book a Call
          </BookCallButton>
          <Button
            size="sm"
            className="rounded-full h-8 px-3 bg-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent-hover)] text-white"
            onClick={() => setFinishOpen(true)}
          >
            <Mail className="mr-2 h-3.5 w-3.5" /> Finish & Email
          </Button>
        </div>

        {/* Mobile: condensed menu */}
        <div className="sm:hidden flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-full px-2">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const res = await fetch('/api/export-summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ sessionId })
                    })
                    if (!res.ok) throw new Error(String(res.status))
                  } catch (e) {
                    console.error('Export summary failed', e)
                  }
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" /> Generate PDF summary
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2">
                <BookCallButton variant="ghost" size="sm" className="justify-start">
                  <PhoneCall className="h-4 w-4" /> Book a Call
                </BookCallButton>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFinishOpen(true)} className="gap-2">
                <Mail className="h-4 w-4" /> Finish & Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send summary via email</DialogTitle>
              <DialogDescription>We'll generate the PDF and email it to the recipient.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const toEmail = finishEmail.trim()
                if (!toEmail) return
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
                  setFinishOpen(false)
                } catch (e) {
                  console.error('Email error:', e)
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <Label htmlFor="finish-email-inline">Recipient email</Label>
                <Input
                  id="finish-email-inline"
                  type="email"
                  value={finishEmail}
                  onChange={(e) => setFinishEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setFinishOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[var(--color-orange-accent)] hover:bg-[var(--color-orange-accent-hover)]">
                  Send
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {visible.map(s => (
        <Button
          key={s.id}
          size="sm"
          variant={s.capability === 'exportPdf' ? 'default' : 'outline'}
          onClick={() => onRun?.(s)}
        >
          {s.label}
        </Button>
      ))}
    </div>
  )
}

export default SuggestedActions


