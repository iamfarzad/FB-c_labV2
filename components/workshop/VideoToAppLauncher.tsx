"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function VideoToAppLauncher({ className }: { className?: string }) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  function isYoutube(u: string) {
    try {
      const x = new URL(u)
      return /youtube\.com|youtu\.be/.test(x.hostname)
    } catch {
      return false
    }
  }

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <Label htmlFor="yt-url" className="text-sm">Paste a YouTube link</Label>
      <div className="mt-2 flex gap-2">
        <Input id="yt-url" placeholder="https://youtu.be/..." value={url} onChange={(e) => { setUrl(e.target.value); setError(null) }} />
        <Button onClick={() => {
          if (!isYoutube(url)) { setError('Enter a valid YouTube URL'); return }
          try { window.localStorage.setItem('fbc:video:last', url) } catch {}
          window.location.href = `/chat?video=${encodeURIComponent(url)}`
        }}>Open Video → App</Button>
      </div>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  )
}

export default VideoToAppLauncher


