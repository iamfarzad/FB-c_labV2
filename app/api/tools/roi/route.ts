import { NextResponse } from 'next/server'
import { z } from 'zod'
import { recordCapabilityUsed } from '@/lib/context/capabilities'
import type { ToolRunResult } from '@/types/intelligence'

const Input = z.object({
  initialInvestment: z.number().min(0),
  monthlyRevenue: z.number().min(0),
  monthlyExpenses: z.number().min(0),
  timePeriod: z.number().min(1).max(60)
})

function round(n: number) { return Math.round(n * 100) / 100 }

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = Input.parse(body)

    const monthlyProfit = data.monthlyRevenue - data.monthlyExpenses
    const totalProfit = monthlyProfit * data.timePeriod
    const totalRevenue = data.monthlyRevenue * data.timePeriod
    const totalExpenses = data.monthlyExpenses * data.timePeriod
    const netProfit = totalProfit - data.initialInvestment
    const roi = ((totalProfit - data.initialInvestment) / Math.max(1, data.initialInvestment)) * 100
    const paybackPeriod = monthlyProfit > 0 ? data.initialInvestment / monthlyProfit : null

    const output = {
      roi: round(roi),
      paybackPeriod: paybackPeriod !== null ? round(paybackPeriod) : null,
      initialInvestment: round(data.initialInvestment),
      monthlyRevenue: round(data.monthlyRevenue),
      monthlyExpenses: round(data.monthlyExpenses),
      monthlyProfit: round(monthlyProfit),
      totalRevenue: round(totalRevenue),
      totalExpenses: round(totalExpenses),
      totalProfit: round(totalProfit),
      netProfit: round(netProfit),
      timePeriod: data.timePeriod,
      calculatedAt: new Date().toISOString()
    }

    const sessionId = (req.headers.get('x-intelligence-session-id') || undefined) as string | undefined
    if (sessionId) {
      try { await recordCapabilityUsed(String(sessionId), 'roi', { input: data, output: { roi: output.roi, paybackPeriod: output.paybackPeriod } }) } catch {}
    }

    return NextResponse.json<ToolRunResult>({ ok: true, output }, { status: 200 })
  } catch (error: any) {
    const message = error?.name === 'ZodError' ? 'Invalid input' : 'Internal server error'
    const status = error?.name === 'ZodError' ? 400 : 500
    return NextResponse.json<ToolRunResult>({ ok: false, error: message }, { status })
  }
}


