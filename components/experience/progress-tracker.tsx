"use client"

import { useEffect, useMemo, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type CapabilityKey =
  | "roi"
  | "doc"
  | "image"
  | "screenshot"
  | "voice"
  | "screenShare"
  | "webcam"
  | "translate"
  | "search"
  | "urlContext"
  | "leadResearch"
  | "meetings"
  | "exportPDF"
  | "calculate"
  | "codeGen"
  | "video2app"

const CAPABILITIES: Record<CapabilityKey, string> = {
  roi: "ROI Calculator",
  doc: "Document Analysis",
  image: "Image Analysis",
  screenshot: "Screenshot Analysis",
  voice: "Voice Chat",
  screenShare: "Screen Share",
  webcam: "Webcam Capture",
  translate: "Translate",
  search: "Google Search Grounding",
  urlContext: "URL Context",
  leadResearch: "Lead Research",
  meetings: "Book Meeting",
  exportPDF: "Export PDF",
  calculate: "Custom Calculation",
  codeGen: "Code/Blueprint",
  video2app: "Video → App",
}

const STORAGE_KEY = "fbc_capabilities_used_v1"

export function markCapabilityUsed(key: CapabilityKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const set = new Set<CapabilityKey>(raw ? (JSON.parse(raw) as CapabilityKey[]) : [])
    set.add(key)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch {}
}

export function ProgressTracker({ className }: { className?: string }) {
  const [used, setUsed] = useState<Set<CapabilityKey>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setUsed(new Set(raw ? (JSON.parse(raw) as CapabilityKey[]) : []))
    } catch {}
  }, [])

  const total = useMemo(() => Object.keys(CAPABILITIES).length, [])
  const count = used.size

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/70 px-3 py-1 text-sm",
              "backdrop-blur-md shadow-sm hover:shadow-md cursor-default",
              className
            )}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold">
              {count}
            </span>
            <span className="text-muted-foreground">Explored</span>
            <span className="font-medium text-primary">{count}/{total}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent align="center" className="max-w-xs">
          <div className="text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-primary">Unlocked capabilities</div>
            <ul className="grid grid-cols-1 gap-1">
              {Object.entries(CAPABILITIES).map(([k, label]) => (
                <li key={k} className={cn("flex items-center gap-2", used.has(k as CapabilityKey) ? "opacity-100" : "opacity-50")}> 
                  <span className={cn("h-1.5 w-1.5 rounded-full", used.has(k as CapabilityKey) ? "bg-accent" : "bg-border")} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


