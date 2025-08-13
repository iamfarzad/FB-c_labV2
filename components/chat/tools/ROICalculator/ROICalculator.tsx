"use client"

import type React from "react"
import { useState } from "react"
import { Calculator, ArrowRight, ArrowLeft, Check, X, Maximize2, Minimize2 } from "@/lib/icon-mapping"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ToolCardWrapper } from "@/components/chat/ToolCardWrapper"
import { cn } from "@/lib/utils"
import type { ROICalculatorProps, ROICalculationResult, WizardStep } from "./ROICalculator.types"
import { markCapabilityUsed } from "@/components/experience/progress-tracker"

// Type for the API response data
type ROICalculationAPIResponse = {
  roi: number;
  paybackPeriod: number | null;
  initialInvestment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  netProfit: number;
  timePeriod: number;
  calculatedAt: string;
}

const WIZARD_STEPS: WizardStep[] = ["company-info", "metrics", "results"];

export function ROICalculator({
  mode = 'card',
  onComplete,
  onCancel,
  onClose
}: ROICalculatorProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState<WizardStep>("company-info")
  const [formData, setFormData] = useState({
    initialInvestment: 5000,
    monthlyRevenue: 10000,
    monthlyExpenses: 6500,
    timePeriod: 12
  })
  const [companyInfo, setCompanyInfo] = useState({
    companySize: "",
    industry: "",
    useCase: ""
  })
  const [result, setResult] = useState<ROICalculationAPIResponse | null>(null)

  const fieldLabels: Record<string, string> = {
    initialInvestment: "Initial Investment ($)",
    monthlyRevenue: "Monthly Revenue ($)",
    monthlyExpenses: "Monthly Expenses ($)",
    timePeriod: "Time Period (months)"
  }

  const handleCalculate = async () => {
    try {
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Calculation failed");
      const data = await response.json();
      if (!data?.ok || !data?.output) throw new Error("Invalid ROI API response");
      setResult(data.output);
      setCurrentStep("results");
      toast({ title: "ROI Calculation Complete", description: "Your ROI analysis is ready!" });
      // mark capability as explored
      markCapabilityUsed("roi")
    } catch (error) {
      console.error('ROI calculation error:', error);
      toast({ 
        title: "Calculation Error", 
        description: (error as Error).message || "Failed to calculate ROI", 
        variant: "destructive" 
      });
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "company-info":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Company Information</h3>
            <div>
              <Label htmlFor="companySize">Company Size</Label>
              <Select value={companyInfo.companySize} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, companySize: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                  <SelectItem value="small">Small (11-50 employees)</SelectItem>
                  <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                  <SelectItem value="large">Large (200+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select value={companyInfo.industry} onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="useCase">Primary Use Case</Label>
              <Input
                id="useCase"
                value={companyInfo.useCase}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, useCase: e.target.value }))}
                placeholder="e.g., Process automation, Customer service, Data analysis"
              />
            </div>
            <Button 
              onClick={() => setCurrentStep("metrics")} 
              className="w-full"
              disabled={!companyInfo.companySize || !companyInfo.industry}
            >
              Next: Enter Metrics
            </Button>
          </div>
        )
      case "metrics":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Financial Metrics</h3>
            <p className="text-sm text-muted-foreground">Enter your business metrics to calculate ROI</p>
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <Label htmlFor={key}>{fieldLabels[key] || key}</Label>
                <Input
                  id={key}
                  type="number"
                  value={value}
                  onChange={(e) => setFormData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  min="0"
                  step={key === 'timePeriod' ? '1' : '0.01'}
                />
              </div>
            ))}
            <Button onClick={handleCalculate} className="w-full" disabled={Object.values(formData).some(v => v <= 0)}>
              Calculate ROI
            </Button>
          </div>
        )
      case "results":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">ROI Analysis Results</h3>
            {result && (
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{result.roi}%</div>
                        <div className="text-sm text-muted-foreground">ROI</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{result.paybackPeriod}</div>
                        <div className="text-sm text-muted-foreground">Payback (months)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Profit:</span>
                    <strong>${result.monthlyProfit?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue ({result.timePeriod} months):</span>
                    <strong>${result.totalRevenue?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <strong>${result.totalExpenses?.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Net Profit:</span>
                    <strong className={result.netProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                      ${result.netProfit?.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            )}
            <Button 
              onClick={() => {
                // Create a combined result with company info and calculations
                const combinedResult = {
                  ...companyInfo,
                  ...result,
                  // Map to expected interface fields for backward compatibility
                  estimatedROI: result.roi,
                  currentProcessTime: 0, // Not applicable in this calculation
                  currentCost: result.monthlyExpenses,
                  automationPotential: 0, // Not applicable
                  timeSavings: 0, // Not applicable
                  costSavings: result.netProfit
                }
                onComplete?.(combinedResult)
              }} 
              className="w-full"
            >
              Complete Analysis
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  const ROICalculatorUI = () => (
    <div className="p-4">
      {renderStep()}
      <div className="flex justify-between mt-4">
          {currentStep !== "company-info" && <Button variant="ghost" onClick={() => setCurrentStep(WIZARD_STEPS[WIZARD_STEPS.indexOf(currentStep) - 1])}>Back</Button>}
          {onCancel && <Button variant="destructive" onClick={onCancel}>Cancel</Button>}
      </div>
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              ROI Calculator
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <ROICalculatorUI />
        </DialogContent>
      </Dialog>
    )
  }

  // Card variant
  return (
    <ToolCardWrapper title="ROI Calculator" description="Calculate the ROI for your business." icon={<Calculator className="w-4 h-4" />}>
      <ROICalculatorUI />
    </ToolCardWrapper>
  )
}
