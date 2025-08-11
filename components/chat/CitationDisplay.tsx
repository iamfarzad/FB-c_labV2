'use client'

import React from 'react'

type Citation = {
  uri: string
  title?: string
  description?: string
}

interface CitationDisplayProps {
  citations?: Citation[]
  className?: string
}

function hostnameFromUrl(uri?: string): string {
  if (!uri) return 'source'
  try {
    const host = new URL(uri).hostname
    return host.replace(/^www\./, '')
  } catch {
    return 'source'
  }
}

/**
 * Standalone citations UI.
 * No external imports required. Safe to drop into any message bubble.
 */
export default function CitationDisplay({ citations, className }: CitationDisplayProps) {
  if (!citations || citations.length === 0) return null

  return (
    <div className={`mt-2 flex flex-wrap gap-2 ${className ?? ''}`}>
      {citations.slice(0, 8).map((c, i) => {
        const host = hostnameFromUrl(c.uri)
        const key = `${host}-${i}`
        return (
          <a
            key={key}
            href={c.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs border rounded-full px-2.5 py-1 hover:bg-muted transition-colors"
            title={c.title || c.uri}
          >
            {/* favicon */}
            <img
              alt=""
              width={14}
              height={14}
              className="rounded"
              src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`}
            />
            <span className="opacity-80">[{i + 1}] {c.title ?? host}</span>
          </a>
        )
      })}
    </div>
  )
}

// Small inline badge, e.g., next to message meta
export function CitationBadge({ citations }: { citations?: Citation[] }) {
  if (!citations || citations.length === 0) return null
  const primary = citations[0]
  const host = hostnameFromUrl(primary.uri)
  return (
    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span>Sources:</span>
      <span className="font-medium">{host}</span>
      {citations.length > 1 && <span className="text-xs">+{citations.length - 1} more</span>}
    </div>
  )
}
