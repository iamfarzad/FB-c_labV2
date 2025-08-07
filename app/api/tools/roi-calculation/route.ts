import { NextRequest, NextResponse } from 'next/server'
import { ROICalculationSchema } from '@/lib/services/tool-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = ROICalculationSchema.parse(body)
    
    // Business logic for ROI calculation
    const { initialInvestment, monthlyRevenue, monthlyExpenses, timePeriod } = validatedData
    
    // Calculate ROI metrics
    const monthlyProfit = monthlyRevenue - monthlyExpenses
    const totalProfit = monthlyProfit * timePeriod
    const roi = ((totalProfit - initialInvestment) / initialInvestment) * 100
    const paybackPeriod = initialInvestment / monthlyProfit // in months
    const totalRevenue = monthlyRevenue * timePeriod
    const totalExpenses = monthlyExpenses * timePeriod
    const netProfit = totalProfit - initialInvestment
    
    // Create response with calculated data
    const response = {
      status: 'success',
      data: {
        roi: Math.round(roi * 100) / 100, // Round to 2 decimal places
        paybackPeriod: Math.round(paybackPeriod * 100) / 100,
        initialInvestment,
        monthlyRevenue,
        monthlyExpenses,
        monthlyProfit: Math.round(monthlyProfit * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        timePeriod,
        calculatedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('ROI calculation API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Invalid input data',
          details: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Internal server error',
        details: 'Failed to process ROI calculation'
      },
      { status: 500 }
    )
  }
}
