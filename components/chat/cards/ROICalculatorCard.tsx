"use client"

import type React from "react"
import { useState } from "react"
import { Calculator, ArrowRight, ArrowLeft, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { cn } from "@/lib/utils"

interface ROICalculatorCardProps {
  onComplete: (result: ROICalculationResult) => void
  onCancel: () => void
}

interface ROICalculationResult {
  companySize: string
  industry: string
  useCase: string
  currentProcessTime: number
  currentCost: number
  automationPotential: number
  estimatedROI: number
  timeSavings: number
  costSavings: number
  paybackPeriod: number
}

type WizardStep = "company-info" | "metrics" | "results"

const COMPANY_SIZES = [
  "Small (1-50 employees)",
  "Medium (51-500 employees)",
  "Large (500+ employees)"
]

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Manufacturing",
  "Retail",
  "Education",
  "Other"
]

const USE_CASES = [
  "Process Automation",
  "Data Analysis",
  "Customer Support",
  "Content Generation",
  "Quality Assurance",
  "Other"
]

export function ROICalculatorCard({ onComplete, onCancel }: ROICalculatorCardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("company-info")
  const [formData, setFormData] = useState({
    companySize: "",
    industry: "",
    useCase: "",
    currentProcessTime: 20,
    currentCost: 5000,
    automationPotential: 70
  })
  const [calculationResult, setCalculationResult] = useState<ROICalculationResult | null>(null)

  const updateFormData = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateROI = (): ROICalculationResult => {
    const { currentProcessTime, currentCost, automationPotential } = formData
    
    // Calculate time savings (hours per week)
    const timeSavings = (currentProcessTime * automationPotential) / 100
    
    // Calculate cost savings (monthly)
    const costSavings = (currentCost * automationPotential) / 100
    
    // Estimate ROI (simplified calculation)
    const estimatedROI = Math.round((costSavings * 12) / (currentCost * 0.1) * 100)
    
    // Calculate payback period (months)
    const paybackPeriod = Math.round((currentCost * 0.1) / costSavings * 12)

    return {
      ...formData,
      estimatedROI,
      timeSavings,
      costSavings,
      paybackPeriod
    }
  }

  const handleNext = () => {
    if (currentStep === "company-info") {
      if (formData.companySize && formData.industry && formData.useCase) {
        setCurrentStep("metrics")
      }
    } else if (currentStep === "metrics") {
      const result = calculateROI()
      setCalculationResult(result)
      setCurrentStep("results")
    }
  }

  const handleBack = () => {
    if (currentStep === "metrics") {
      setCurrentStep("company-info")
    } else if (currentStep === "results") {
      setCurrentStep("metrics")
    }
  }

  const handleComplete = () => {
    if (calculationResult) {
      onComplete(calculationResult)
    }
  }

  const renderCompanyInfoStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companySize">Company Size</Label>
        <Select value={formData.companySize} onValueChange={(value) => updateFormData("companySize", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">Use Case</Label>
        <Select value={formData.useCase} onValueChange={(value) => updateFormData("useCase", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select use case" />
          </SelectTrigger>
          <SelectContent>
            {USE_CASES.map((useCase) => (
              <SelectItem key={useCase} value={useCase}>
                {useCase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderMetricsStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentProcessTime">Current Process Time (hours/week)</Label>
        <Input
          id="currentProcessTime"
          type="number"
          value={formData.currentProcessTime}
          onChange={(e) => updateFormData("currentProcessTime", parseInt(e.target.value) || 0)}
          min="1"
          max="168"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentCost">Current Cost ($/month)</Label>
        <Input
          id="currentCost"
          type="number"
          value={formData.currentCost}
          onChange={(e) => updateFormData("currentCost", parseInt(e.target.value) || 0)}
          min="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="automationPotential">Automation Potential (%)</Label>
        <Input
          id="automationPotential"
          type="number"
          value={formData.automationPotential}
          onChange={(e) => updateFormData("automationPotential", parseInt(e.target.value) || 0)}
          min="1"
          max="100"
        />
      </div>
    </div>
  )

  const renderResultsStep = () => {
    if (!calculationResult) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-minimal">
            <h4 className="font-semibold text-foreground mb-2">Estimated ROI</h4>
            <p className="text-2xl font-bold text-accent">{calculationResult.estimatedROI}%</p>
          </div>
          
          <div className="card-minimal">
            <h4 className="font-semibold text-foreground mb-2">Monthly Cost Savings</h4>
            <p className="text-2xl font-bold text-accent">${calculationResult.costSavings.toLocaleString()}</p>
          </div>
          
          <div className="card-minimal">
            <h4 className="font-semibold text-foreground mb-2">Time Savings</h4>
            <p className="text-2xl font-bold text-accent">{calculationResult.timeSavings.toFixed(1)} hrs/week</p>
          </div>
          
          <div className="card-minimal">
            <h4 className="font-semibold text-foreground mb-2">Payback Period</h4>
            <p className="text-2xl font-bold text-accent">{calculationResult.paybackPeriod} months</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">
            Based on your {calculationResult.companySize} company in {calculationResult.industry} 
            implementing {calculationResult.useCase}, you can expect significant productivity gains 
            and cost savings through AI automation.
          </p>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "company-info":
        return renderCompanyInfoStep()
      case "metrics":
        return renderMetricsStep()
      case "results":
        return renderResultsStep()
      default:
        return null
    }
  }

  const canProceed = () => {
    if (currentStep === "company-info") {
      return formData.companySize && formData.industry && formData.useCase
    }
    if (currentStep === "metrics") {
      return formData.currentProcessTime > 0 && formData.currentCost >= 0 && formData.automationPotential > 0
    }
    return true
  }

  return (
    <ToolCardWrapper
      title="ROI Calculator"
      description="Calculate the return on investment for AI implementation"
      icon={<Calculator className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {["company-info", "metrics", "results"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step 
                  ? "bg-accent text-accent-foreground" 
                  : index < ["company-info", "metrics", "results"].indexOf(currentStep)
                  ? "bg-accent/20 text-accent"
                  : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={cn(
                  "w-8 h-1 mx-2",
                  index < ["company-info", "metrics", "results"].indexOf(currentStep)
                    ? "bg-accent"
                    : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep !== "company-info" && (
              <button
                onClick={handleBack}
                className="btn-secondary"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === "results" ? (
              <button
                onClick={handleComplete}
                className="btn-primary"
                aria-label="Complete ROI calculation"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary"
                aria-label="Continue to next step"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}

            <button
              onClick={onCancel}
              className="btn-secondary"
              aria-label="Cancel ROI calculation"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ToolCardWrapper>
  )
} 