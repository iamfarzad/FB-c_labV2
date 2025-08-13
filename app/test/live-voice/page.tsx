"use client"

import { useEffect, useRef, useState } from 'react'

export default function LiveVoiceTestPage() {
  const [status, setStatus] = useState<'idle'|'connecting'|'connected'|'closed'|'error'>('idle')
  const [log, setLog] = useState<string[]>([])
  const [transcript, setTranscript] = useState<string>("")
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const audioContextRef = useRef<AudioContext|null>(null)
  const sessionRef = useRef<any>(null)
  const tokenRef = useRef<string|undefined>(undefined)

  const model = process.env.NEXT_PUBLIC_LIVE_MODEL || process.env.NEXT_PUBLIC_GEMINI_LIVE_MODEL || 'gemini-live-2.5-flash-preview'

  function addLog(s: string) { setLog(prev => [...prev.slice(-200), s]) }

  async function requestMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: { ideal: 16000 }, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      stream.getTracks().forEach(t => t.stop())
      setHasPermission(true)
      addLog('✅ Mic permission granted')
    } catch (e: any) {
      addLog(`❌ Mic permission error: ${e?.message || e}`)
      setHasPermission(false)
    }
  }

  async function connect() {
    setStatus('connecting')
    const { GoogleGenAI, Modality, MediaResolution } = await import('@google/genai')
    const url = new URL(window.location.href)
    const useDirect = url.searchParams.get('direct') === '1'

    let ai: any
    if (useDirect && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      addLog('🔑 Using direct browser API key (dev only)')
      ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY, apiVersion: 'v1alpha' })
    } else {
      addLog('🔐 Fetching ephemeral token…')
      const res = await fetch('/api/live/token', { method: 'POST', cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json?.token) {
        setStatus('error')
        addLog(`❌ Token error: ${json?.error || res.status}`)
        return
      }
      tokenRef.current = json.token
      addLog('🔑 Token received')
      ai = new GoogleGenAI({ apiKey: tokenRef.current, apiVersion: 'v1alpha' })
    }
    addLog(`🔌 Connecting live session (${model})…`)

    const responseQueue: any[] = []
    function enqueue(m: any) { responseQueue.push(m) }

    sessionRef.current = await ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO, Modality.TEXT],
        inputAudioTranscription: {},
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
      },
      callbacks: {
        onopen: () => { setStatus('connected'); addLog('✅ Session open') },
        onmessage: (m: any) => { enqueue(m); handleServerMessage(m) },
        onerror: (e: any) => { addLog(`❌ Session error: ${e?.message || 'unknown'}`); console.error('Live onerror', e) },
        onclose: (e: any) => { setStatus('closed'); addLog(`🔚 Session closed${e?.reason ? `: ${e.reason}` : ''}`) },
      },
    })
  }

  function ensureCtx() {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
    }
    return audioContextRef.current
  }

  function playPcm24kBase64(b64: string) {
    try {
      const ctx = ensureCtx()
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
      const view = new DataView(bytes.buffer)
      const samples = view.byteLength / 2
      const f32 = new Float32Array(samples)
      for (let i=0;i<samples;i++) f32[i] = Math.max(-1, Math.min(1, view.getInt16(i*2, true) / 32768))
      const buffer = ctx.createBuffer(1, f32.length, 24000)
      buffer.copyToChannel(f32, 0)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(ctx.destination)
      src.start()
    } catch (e) {
      addLog(`⚠️ audio decode error: ${(e as any)?.message || e}`)
    }
  }

  function handleServerMessage(message: any) {
    const parts = message?.serverContent?.modelTurn?.parts
    if (Array.isArray(parts)) {
      for (const p of parts) {
        if (typeof p?.text === 'string') setTranscript(prev => prev + p.text)
        if (p?.inlineData?.data) playPcm24kBase64(p.inlineData.data)
      }
    }
  }

  async function startMic() {
    if (!sessionRef.current) { addLog('⚠️ No session. Click Connect first.'); return }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: { ideal: 16000 }, echoCancellation: true, noiseSuppression: true } })
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 })
    const source = ctx.createMediaStreamSource(stream)
    const processor = ctx.createScriptProcessor(4096, 1, 1)
    processor.onaudioprocess = (ev) => {
      const input = ev.inputBuffer.getChannelData(0)
      const pcm16 = floatTo16BitPCM(input)
      const b64 = arrayBufferToBase64(pcm16.buffer as ArrayBuffer)
      try { sessionRef.current.sendRealtimeInput({ audio: { data: b64, mimeType: 'audio/pcm;rate=16000' } }) } catch {}
    }
    source.connect(processor); processor.connect(ctx.destination)
    addLog('🎙️ Mic streaming… Press Stop to end')

    // store to stop later
    ;(sessionRef.current as any)._mic = { stream, ctx, processor, source }
  }

  function stopMic() {
    const m = (sessionRef.current as any)?._mic
    try { m?.processor?.disconnect(); m?.source?.disconnect(); m?.ctx?.close() } catch {}
    try { m?.stream?.getTracks?.().forEach((t: MediaStreamTrack) => t.stop()) } catch {}
    addLog('🛑 Mic stopped')
  }

  function floatTo16BitPCM(float32: Float32Array) {
    const out = new Int16Array(float32.length)
    for (let i=0;i<float32.length;i++) {
      const s = Math.max(-1, Math.min(1, float32[i]))
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return out
  }
  function arrayBufferToBase64(buf: ArrayBuffer) {
    let binary = ''
    const bytes = new Uint8Array(buf)
    for (let i=0;i<bytes.byteLength;i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  useEffect(() => { requestMic() }, [])

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Live API Voice – Minimal Test</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>Direct client → Gemini Live using ephemeral tokens. Model: <code>{model}</code></p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={connect} disabled={status==='connected' || status==='connecting'} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}>Connect</button>
        <button onClick={startMic} disabled={status!=='connected'} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}>Start Mic</button>
        <button onClick={stopMic} disabled={status!=='connected'} style={{ padding: '8px 12px', border: '1px solid #ccc', borderRadius: 6 }}>Stop</button>
      </div>
      <div style={{ marginBottom: 12 }}>Status: <b>{status}</b> {hasPermission ? '· mic ok' : '· mic blocked'}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Transcript</div>
          <div style={{ minHeight: 120, whiteSpace: 'pre-wrap', padding: 8, border: '1px solid #ddd', borderRadius: 6, background: '#fafafa' }}>{transcript || '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Logs</div>
          <div style={{ minHeight: 120, padding: 8, border: '1px solid #ddd', borderRadius: 6, background: '#fafafa', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}>
            {log.map((l, i) => (<div key={i}>{l}</div>))}
          </div>
        </div>
      </div>
    </div>
  )
}


