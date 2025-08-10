"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface CitationsDemoProps {
  className?: string
}

export function CitationsDemo({ className }: CitationsDemoProps) {
  return (
    <div className={cn("rounded-xl border border-border/40 bg-card/70 p-4 backdrop-blur-md", className)}>
      <div className="text-sm font-medium text-primary">Grounded answers include sources</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <a className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/80 transition-colors" href="#" onClick={(e) => e.preventDefault()}>google.com • AI for Developers</a>
        <a className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/80 transition-colors" href="#" onClick={(e) => e.preventDefault()}>support.google.com • Search</a>
        <a className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted/80 transition-colors" href="#" onClick={(e) => e.preventDefault()}>developers.google.com • Gemini</a>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Try the live demo with citations
        <Link href="/chat?useSearch=1" className="ml-2 underline text-primary hover:text-accent">Open Chat</Link>
      </div>
    </div>
  )
}


