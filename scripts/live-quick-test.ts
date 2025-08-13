import { GoogleGenAI, Modality } from '@google/genai'

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_LIVE_MODEL || 'gemini-2.0-flash-live-001'
  if (!apiKey) {
    console.error('No GEMINI_API_KEY in env')
    process.exit(1)
  }
  console.log('Model:', model)
  const ai = new GoogleGenAI({ apiKey })
  try {
    const session = await ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.TEXT],
        // send just text to validate session stays open
      },
      callbacks: {
        onopen: () => console.log('onopen OK'),
        onmessage: (m: any) => console.log('onmessage type:', Object.keys(m || {})),
        onerror: (e: any) => console.error('onerror', e?.message || e),
        onclose: (e: any) => console.log('onclose', e?.reason || ''),
      },
    })
    // send a simple turn with no audio
    await (session as any).sendClientContent({
      turns: [{ role: 'user', parts: [{ text: 'ping' }] }],
      turnComplete: true,
    })
    setTimeout(() => {
      try { (session as any).close?.() } catch {}
      process.exit(0)
    }, 3000)
  } catch (e: any) {
    console.error('connect failed', e?.message || e)
    process.exit(2)
  }
}

main().catch(err => { console.error(err); process.exit(3) })


