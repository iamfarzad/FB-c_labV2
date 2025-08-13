export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Fire-and-forget sink: rely on Vercel logs; optionally forward to webhook later
    console.log('intel_event', body)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 400 })
  }
}


