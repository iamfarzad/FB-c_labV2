import { NextRequest, NextResponse } from 'next/server'

type ConsentCookie = {
  allow: boolean
  allowedDomains: string[]
  ts: number
  policyVersion?: string
}

function inferDomainFromEmail(email?: string): string | null {
  if (!email || !email.includes('@')) return null
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return null
  const generic = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','proton.me','protonmail.com']
  if (generic.includes(domain)) return null
  return domain
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('fbc-consent')?.value
  if (!cookie) return NextResponse.json({ allow: false }, { status: 200 })
  try {
    const data = JSON.parse(cookie) as ConsentCookie
    return NextResponse.json({ allow: !!data.allow, allowedDomains: data.allowedDomains, ts: data.ts })
  } catch {
    return NextResponse.json({ allow: false }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, companyUrl, policyVersion } = await req.json()
    let domain: string | null = null
    const inferred = inferDomainFromEmail(email)
    if (inferred) domain = inferred
    else if (typeof companyUrl === 'string' && companyUrl.length > 3) {
      try { domain = new URL(companyUrl.startsWith('http') ? companyUrl : `https://${companyUrl}`).hostname } catch {}
    }
    const allowedDomains = Array.from(new Set([domain].filter(Boolean) as string[]).values())
    // Always allow linkedin.com as secondary source if a domain exists
    if (allowedDomains.length) allowedDomains.push('linkedin.com')

    const value: ConsentCookie = { allow: true, allowedDomains, ts: Date.now(), policyVersion }
    const res = NextResponse.json({ ok: true, allowedDomains })
    res.cookies.set('fbc-consent', JSON.stringify(value), { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 })
    return res
  } catch (e: any) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('fbc-consent', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
  return res
}


