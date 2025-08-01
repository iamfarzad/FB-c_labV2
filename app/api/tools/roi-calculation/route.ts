import { NextRequest, NextResponse } from 'next/server'
import { ROICalculationSchema } from '@/lib/services/tool-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input using Zod schema
    const validatedData = ROICalculationSchema.parse(body)
    
    // Business logic for ROI calculation
    const { currentCosts, projectedSavings, implementationCost, timeFrameMonths } = validatedData
    
    // Calculate ROI metrics
    const totalSavings = projectedSavings - implementationCost
    const roi = (totalSavings / implementationCost) * 100
    const paybackPeriod = implementationCost / (projectedSavings / timeFrameMonths)
    const monthlySavings = projectedSavings / timeFrameMonths
    
    // Create response with calculated data
    const response = {
      status: 'success',
      data: {
        roi,
        paybackPeriod,
        currentCosts,
        projectedSavings,
        implementationCost,
        monthlySavings,
        totalSavings,
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
