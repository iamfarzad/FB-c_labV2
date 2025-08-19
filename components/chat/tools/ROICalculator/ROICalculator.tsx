"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Calculator, ArrowRight, ArrowLeft, Check, X, Maximize2, Minimize2 } from "@/lib/icon-mapping"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
  onClose,
  sessionId,
  defaults
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
    companySize: defaults?.companySize || "",
    industry: defaults?.industry || "",
    useCase: defaults?.useCase || ""
  })
  const [lastHash, setLastHash] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ROICalculationAPIResponse | null>(null)

  const fieldLabels: Record<string, string> = {
    initialInvestment: "Initial Investment ($)",
    monthlyRevenue: "Monthly Revenue ($)",
    monthlyExpenses: "Monthly Expenses ($)",
    timePeriod: "Time Period (months)"
  }

  const cacheKey = useMemo(() => {
    const key = `${sessionId || 'anon'}:${formData.initialInvestment}:${formData.monthlyRevenue}:${formData.monthlyExpenses}:${formData.timePeriod}`
    return `fbc:roi:${key}`
  }, [sessionId, formData])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) {
        const cached = JSON.parse(raw) as { output: ROICalculationAPIResponse, ts: number }
        setResult(cached.output)
        setCurrentStep("results")
        setLastHash(cacheKey)
      }
    } catch {}
    const t = window.setTimeout(() => { if (!lastHash) void handleCalculate(true) }, 200)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCalculate = async (isAuto?: boolean) => {
    try {
      setIsRunning(true)
      const response = await fetch('/api/tools/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'x-intelligence-session-id': sessionId } : {}) },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Calculation failed");
      const data = await response.json();
      if (!data?.ok || !data?.output) throw new Error("Invalid ROI API response");
      setResult(data.output);
      setCurrentStep("results");
      if (!isAuto) toast({ title: "ROI Calculation Complete", description: "Your ROI analysis is ready!" });
      // mark capability as explored
      markCapabilityUsed("roi")
      try { localStorage.setItem(cacheKey, JSON.stringify({ output: data.output, ts: Date.now() })) } catch {}
      setLastHash(cacheKey)
    } catch (error) {
      console.error('ROI calculation error:', error);
      toast({ 
        title: "Calculation Error", 
        description: (error as Error).message || "Failed to calculate ROI", 
        variant: "destructive" 
      });
    } finally { setIsRunning(false) }
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
          <div className="space-y-3">
            <h3 className="font-semibold">ROI Analysis Results</h3>
            {result && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-md bg-accent/10">
                    <div className="text-xl font-bold text-accent">{result.roi}%</div>
                    <div className="text-xs text-muted-foreground">ROI</div>
                  </div>
                  <div className="text-center p-3 rounded-md bg-accent/5">
                    <div className="text-xl font-bold">{result.paybackPeriod ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">Payback (mo)</div>
                  </div>
                  <div className="text-center p-3 rounded-md bg-accent/5">
                    <div className={`text-lg font-bold ${result.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netProfit?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Net Profit</div>
                  </div>
                </div>

                <Accordion type="single" collapsible defaultValue="details">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm">Financial Breakdown</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Profit</span>
                          <strong>${result.monthlyProfit?.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Revenue ({result.timePeriod} mo)</span>
                          <strong>${result.totalRevenue?.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Expenses</span>
                          <strong>${result.totalExpenses?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
            <Button 
              onClick={() => {
                if (!result) return;
                const combinedResult: ROICalculationResult = {
                  ...companyInfo,
                  estimatedROI: result.roi,
                  paybackPeriod: result.paybackPeriod || 0,
                  currentProcessTime: 0,
                  currentCost: result.monthlyExpenses,
                  automationPotential: 0,
                  timeSavings: 0,
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

  const ROICalculatorUI = ({ showSidebar = true }: { showSidebar?: boolean } = {}) => (
    <div className="h-full lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-4 flex">
      {/* Main ROI Calculator Area */}
      <div className="flex-1 p-4">
        <div>
          <Card className="w-full bg-card border border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-xl mb-2">
                {currentStep === "company-info" && "Company Information"}
                {currentStep === "metrics" && "Financial Metrics"}
                {currentStep === "results" && "ROI Analysis Results"}
              </CardTitle>
              <p className="text-muted-foreground">
                {currentStep === "company-info" && "Tell us about your company to get started"}
                {currentStep === "metrics" && "Enter your business metrics to calculate ROI"}
                {currentStep === "results" && "Your ROI analysis is complete"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
      <div className="w-72 p-4 space-y-4 hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    WIZARD_STEPS.indexOf(currentStep) > index 
                      ? 'bg-accent/10 text-accent' 
                      : WIZARD_STEPS.indexOf(currentStep) === index 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {WIZARD_STEPS.indexOf(currentStep) > index ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {step === "company-info" && "Company Info"}
                      {step === "metrics" && "Financial Data"}
                      {step === "results" && "Results"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step === "company-info" && "Basic information"}
                      {step === "metrics" && "Revenue & expenses"}
                      {step === "results" && "ROI calculation"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentStep === "results" && result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3" aria-live="polite">
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center p-3 rounded-lg bg-accent/10">
                  <div className="text-2xl font-bold text-accent">{result?.roi}%</div>
                  <div className="text-sm text-muted-foreground">Return on Investment</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-accent/5">
                  <div className="text-2xl font-bold">{result?.paybackPeriod || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">Payback Period (months)</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-accent/5">
                  <div className="text-lg font-bold">${result?.netProfit?.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Net Profit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentStep !== "company-info" && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setCurrentStep(WIZARD_STEPS[WIZARD_STEPS.indexOf(currentStep) - 1])}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isRunning} onClick={() => handleCalculate(false)}>
              Re-run Analysis
            </Button>
            {onCancel && (
              <Button variant="ghost" className="w-full" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )

  // Modal variant
  if (mode === 'modal') {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl p-0">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              ROI Calculator
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-6">
            <ROICalculatorUI showSidebar={false} />
          </div>
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
