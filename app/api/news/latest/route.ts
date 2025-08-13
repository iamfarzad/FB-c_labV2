import { NextRequest, NextResponse } from 'next/server'
import { fetchLatestNews } from '@/lib/services/news-service'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const locale = searchParams.get('locale') || undefined
    const industry = searchParams.get('industry') || undefined
    const role = searchParams.get('role') || undefined
    const items = await fetchLatestNews({ locale, industry, role })
    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 })
  }
}


