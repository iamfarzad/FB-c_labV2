"use client"

import type React from "react"
import { useState } from "react"
import { X, Calculator, TrendingUp, Clock, DollarSign, Users, Building2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"

interface ROIParameters {
  companySize: 'small' | 'medium' | 'large' | 'enterprise'
  industry: string
  useCase: string
  currentProcessTime: number
  currentCost: number
  automationPotential: number
}

interface ROICalculation {
  annualSavings: number
  timeSavings: number
  costSavings: number
  paybackPeriod: number
  implementationCost: number
  roiPercentage: number
  recommendations: string[]
}

interface ROICalculatorModalProps {
  isOpen: boolean
  onClose: () => void
}

const INDUSTRIES = [
  'technology', 'healthcare', 'finance', 'manufacturing', 'retail',
  'consulting', 'education', 'government', 'nonprofit', 'other'
]

const USE_CASES = [
  'document_processing', 'customer_support', 'data_analysis', 'content_generation',
  'process_automation', 'quality_assurance', 'scheduling', 'inventory_management',
  'financial_analysis', 'hr_processes', 'marketing_automation', 'sales_automation', 'other'
]

const COMPANY_SIZES = [
  { value: 'small', label: 'Small (1-50 employees)', icon: Users },
  { value: 'medium', label: 'Medium (51-500 employees)', icon: Building2 },
  { value: 'large', label: 'Large (501-5000 employees)', icon: Building2 },
  { value: 'enterprise', label: 'Enterprise (5000+ employees)', icon: Building2 }
]

export const ROICalculatorModal: React.FC<ROICalculatorModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast()
  const { addActivity } = useChatContext()
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculation, setCalculation] = useState<ROICalculation | null>(null)
  const [formData, setFormData] = useState<ROIParameters>({
    companySize: 'medium',
    industry: 'technology',
    useCase: 'process_automation',
    currentProcessTime: 20,
    currentCost: 5000,
    automationPotential: 70
  })

  if (!isOpen) return null

  const handleInputChange = (field: keyof ROIParameters, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateROI = async () => {
    setIsCalculating(true)
    setCalculation(null)

    try {
      addActivity({
        type: "ai_request",
        title: "ROI Calculation Started",
        description: `Calculating ROI for ${formData.useCase} in ${formData.industry}`,
        status: "in_progress"
      })

      const response = await fetch('/api/calculate-roi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to calculate ROI`)
      }

      const data = await response.json()
      setCalculation(data.calculation)

      addActivity({
        type: "complete",
        title: "ROI Calculation Complete",
        description: `Annual savings: $${data.calculation.annualSavings.toLocaleString()}`,
        status: "completed"
      })

      toast({
        title: "ROI Calculation Complete",
        description: `Estimated annual savings: $${data.calculation.annualSavings.toLocaleString()}`,
      })
    } catch (error: any) {
      console.error('ROI calculation error:', error)
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate ROI",
        variant: "destructive"
      })

      addActivity({
        type: "error",
        title: "ROI Calculation Failed",
        description: error.message || "Failed to calculate ROI",
        status: "failed"
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const getROIColor = (roi: number) => {
    if (roi > 200) return "text-green-600 bg-green-100 dark:bg-green-900/20"
    if (roi > 100) return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
    if (roi > 50) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
    if (roi > 0) return "text-orange-600 bg-orange-100 dark:bg-orange-900/20"
    return "text-red-600 bg-red-100 dark:bg-red-900/20"
  }

  const getROILabel = (roi: number) => {
    if (roi > 200) return "Exceptional"
    if (roi > 100) return "Strong"
    if (roi > 50) return "Good"
    if (roi > 0) return "Positive"
    return "Negative"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-background rounded-lg shadow-2xl w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-accent" />
            <div>
              <h2 className="text-xl font-semibold">ROI Calculator</h2>
              <p className="text-sm text-muted-foreground">Calculate the return on investment for AI implementation</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            <div className="flex items-center gap-2">
                              <size.icon className="h-4 w-4" />
                              {size.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry.charAt(0).toUpperCase() + industry.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="useCase">Use Case</Label>
                    <Select value={formData.useCase} onValueChange={(value) => handleInputChange('useCase', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USE_CASES.map((useCase) => (
                          <SelectItem key={useCase} value={useCase}>
                            {useCase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Current Process Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentProcessTime">Current Process Time (hours/week)</Label>
                    <Input
                      id="currentProcessTime"
                      type="number"
                      value={formData.currentProcessTime}
                      onChange={(e) => handleInputChange('currentProcessTime', Number(e.target.value))}
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
                      onChange={(e) => handleInputChange('currentCost', Number(e.target.value))}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="automationPotential">Automation Potential (%)</Label>
                    <Input
                      id="automationPotential"
                      type="number"
                      value={formData.automationPotential}
                      onChange={(e) => handleInputChange('automationPotential', Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={calculateROI} 
                disabled={isCalculating}
                className="w-full"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Calculating ROI...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate ROI
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {calculation ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        ROI Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            ${calculation.annualSavings.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">Annual Savings</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {calculation.roiPercentage}%
                          </div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                        </div>
                      </div>

                      <Badge className={`w-fit ${getROIColor(calculation.roiPercentage)}`}>
                        {getROILabel(calculation.roiPercentage)} ROI
                      </Badge>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{calculation.timeSavings.toLocaleString()} hours/year saved</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${calculation.implementationCost.toLocaleString()} implementation cost</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{calculation.paybackPeriod} months payback</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${calculation.costSavings.toLocaleString()} cost savings</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {calculation.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                    <CardDescription>
                      Fill out the form and click "Calculate ROI" to see your results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No calculation yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ROICalculatorModal
