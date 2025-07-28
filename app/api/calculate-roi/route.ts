import { NextRequest, NextResponse } from 'next/server'

interface ROIParameters {
  companySize: 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  useCase: string
  currentProcessTime: number // hours per week
  currentCost: number // dollars per month
  automationPotential: number // percentage (0-100)
}

interface ROICalculation {
  annualSavings: number
  timeSavings: number // hours per year
  costSavings: number // dollars per year
  paybackPeriod: number // months
  implementationCost: number
  roiPercentage: number
  recommendations: string[]
}

const INDUSTRY_MULTIPLIERS = {
  'technology': 1.2,
  'healthcare': 1.1,
  'finance': 1.3,
  'manufacturing': 1.0,
  'retail': 0.9,
  'consulting': 1.4,
  'education': 0.8,
  'government': 0.7,
  'nonprofit': 0.6,
  'other': 1.0
}

const COMPANY_SIZE_MULTIPLIERS = {
  'small': 0.8, // 1-50 employees
  'medium': 1.0, // 51-500 employees
  'large': 1.2, // 501-5000 employees
  'enterprise': 1.5 // 5000+ employees
}

const USE_CASE_EFFICIENCIES = {
  'document_processing': 0.85,
  'customer_support': 0.75,
  'data_analysis': 0.90,
  'content_generation': 0.80,
  'process_automation': 0.95,
  'quality_assurance': 0.70,
  'scheduling': 0.85,
  'inventory_management': 0.90,
  'financial_analysis': 0.85,
  'hr_processes': 0.75,
  'marketing_automation': 0.80,
  'sales_automation': 0.85,
  'other': 0.75
}

export async function POST(request: NextRequest) {
  try {
    const params: ROIParameters = await request.json()
    
    // Validate required parameters
    if (!params.companySize || !params.industry || !params.useCase) {
      return NextResponse.json({ 
        error: 'Missing required parameters: companySize, industry, useCase' 
      }, { status: 400 })
    }

    // Set defaults for optional parameters
    const currentProcessTime = params.currentProcessTime || 20 // hours per week
    const currentCost = params.currentCost || 5000 // dollars per month
    const automationPotential = Math.min(Math.max(params.automationPotential || 70, 0), 100) // percentage

    // Calculate base metrics
    const annualProcessTime = currentProcessTime * 52 // hours per year
    const annualCurrentCost = currentCost * 12 // dollars per year
    const hourlyRate = annualCurrentCost / annualProcessTime // dollars per hour

    // Apply multipliers
    const industryMultiplier = INDUSTRY_MULTIPLIERS[params.industry as keyof typeof INDUSTRY_MULTIPLIERS] || 1.0
    const sizeMultiplier = COMPANY_SIZE_MULTIPLIERS[params.companySize]
    const efficiencyGain = USE_CASE_EFFICIENCIES[params.useCase as keyof typeof USE_CASE_EFFICIENCIES] || 0.75

    // Calculate savings
    const timeSavings = annualProcessTime * (automationPotential / 100) * efficiencyGain
    const costSavings = timeSavings * hourlyRate * industryMultiplier * sizeMultiplier
    const annualSavings = costSavings

    // Calculate implementation costs (based on company size and complexity)
    const baseImplementationCost = 25000 // base cost
    const sizeCostMultiplier = {
      'small': 0.6,
      'medium': 1.0,
      'large': 1.5,
      'enterprise': 2.5
    }[params.companySize]

    const implementationCost = baseImplementationCost * sizeCostMultiplier * industryMultiplier

    // Calculate ROI metrics
    const paybackPeriod = implementationCost / (annualSavings / 12) // months
    const roiPercentage = ((annualSavings - implementationCost) / implementationCost) * 100

    // Generate recommendations
    const recommendations = generateRecommendations(params, annualSavings, paybackPeriod, roiPercentage)

    const calculation: ROICalculation = {
      annualSavings: Math.round(annualSavings),
      timeSavings: Math.round(timeSavings),
      costSavings: Math.round(costSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10, // Round to 1 decimal
      implementationCost: Math.round(implementationCost),
      roiPercentage: Math.round(roiPercentage * 10) / 10, // Round to 1 decimal
      recommendations
    }

    return NextResponse.json({
      calculation,
      parameters: params,
      assumptions: {
        industryMultiplier,
        sizeMultiplier,
        efficiencyGain,
        hourlyRate: Math.round(hourlyRate * 100) / 100
      }
    })

  } catch (error: any) {
    console.error('ROI calculation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 })
  }
}

function generateRecommendations(params: ROIParameters, annualSavings: number, paybackPeriod: number, roiPercentage: number): string[] {
  const recommendations: string[] = []

  // ROI-based recommendations
  if (roiPercentage > 200) {
    recommendations.push('Exceptional ROI - This is a high-priority implementation opportunity')
  } else if (roiPercentage > 100) {
    recommendations.push('Strong ROI - Recommended for implementation within 6 months')
  } else if (roiPercentage > 50) {
    recommendations.push('Good ROI - Consider implementing after higher-ROI projects')
  } else if (roiPercentage > 0) {
    recommendations.push('Positive ROI - Consider for strategic value beyond direct savings')
  } else {
    recommendations.push('Negative ROI - Consider alternative approaches or wait for technology improvements')
  }

  // Payback period recommendations
  if (paybackPeriod < 6) {
    recommendations.push('Quick payback period - Consider expedited implementation')
  } else if (paybackPeriod < 12) {
    recommendations.push('Reasonable payback period - Standard implementation timeline recommended')
  } else if (paybackPeriod < 24) {
    recommendations.push('Longer payback period - Consider phased implementation approach')
  } else {
    recommendations.push('Extended payback period - Evaluate strategic value and alternative solutions')
  }

  // Company size specific recommendations
  if (params.companySize === 'small') {
    recommendations.push('Small company optimization - Focus on high-impact, low-complexity solutions')
  } else if (params.companySize === 'enterprise') {
    recommendations.push('Enterprise scale - Consider comprehensive change management and training programs')
  }

  // Industry specific recommendations
  if (params.industry === 'healthcare') {
    recommendations.push('Healthcare compliance - Ensure HIPAA and regulatory compliance in implementation')
  } else if (params.industry === 'finance') {
    recommendations.push('Financial security - Prioritize data security and audit trail requirements')
  } else if (params.industry === 'manufacturing') {
    recommendations.push('Manufacturing efficiency - Consider integration with existing production systems')
  }

  // Use case specific recommendations
  if (params.useCase === 'customer_support') {
    recommendations.push('Customer experience focus - Ensure AI enhances rather than replaces human touch')
  } else if (params.useCase === 'data_analysis') {
    recommendations.push('Data quality - Invest in data cleaning and validation processes')
  } else if (params.useCase === 'process_automation') {
    recommendations.push('Process optimization - Map and optimize existing processes before automation')
  }

  // Savings-based recommendations
  if (annualSavings > 100000) {
    recommendations.push('High-value opportunity - Consider executive sponsorship and dedicated project team')
  } else if (annualSavings > 50000) {
    recommendations.push('Significant savings - Allocate appropriate resources for successful implementation')
  }

  return recommendations.slice(0, 5) // Limit to top 5 recommendations
}
