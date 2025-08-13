"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Item = { title: string; url: string; source: string; publishedAt?: string; category: string; keyFindings: string[] }

export function NewsBrief({ className }: { className?: string }) {
  const [items, setItems] = useState<Item[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all'|'providers'|'prompting'|'nocode'|'research'|'product'>('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/news/latest', { cache: 'no-store' })
        if (!res.ok) throw new Error('fetch failed')
        const j = await res.json()
        if (!cancelled) setItems(j.items || [])
      } catch (e: any) {
        if (!cancelled) setErr('unavailable')
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (err || items.length === 0) return null

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <Card className={cn('neu-card', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Weekly AI Brief</CardTitle>
          <div className="flex gap-2">
            {(['all','providers','prompting','nocode','research','product'] as const).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>{f}</Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {filtered.map((it, idx) => (
            <li key={idx} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{it.title}</a>
                <span className="text-xs text-muted-foreground">{it.source}</span>
              </div>
              {it.keyFindings?.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {it.keyFindings.slice(0,2).map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              )}
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  try {
                    const context = `News context:\n- ${it.title}\n- ${it.source}\n${it.keyFindings.map(b=>`• ${b}`).join('\n')}\n\n${it.url}`
                    window.localStorage.setItem('fbc:news:last', context)
                    window.location.href = '/chat?news=1'
                  } catch {}
                }}>Explain in Chat</Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(it.url, '_blank')}>Open</Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default NewsBrief


