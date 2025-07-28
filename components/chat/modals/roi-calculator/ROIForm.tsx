"use client"

import type React from "react"
import { useState } from "react"
import { Building2, Zap, Calculator, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ROIParameters } from "../ROICalculatorModal"

const INDUSTRIES = [
  "technology",
  "healthcare",
  "finance",
  "manufacturing",
  "retail",
  "consulting",
  "education",
  "government",
  "nonprofit",
  "other",
]

const USE_CASES = [
  "document_processing",
  "customer_support",
  "data_analysis",
  "content_generation",
  "process_automation",
  "quality_assurance",
  "scheduling",
  "inventory_management",
  "financial_analysis",
  "hr_processes",
  "marketing_automation",
  "sales_automation",
  "other",
]

const COMPANY_SIZES = [
  { value: "small", label: "Small (1-50 employees)", icon: Users },
  { value: "medium", label: "Medium (51-500 employees)", icon: Building2 },
  { value: "large", label: "Large (501-5000 employees)", icon: Building2 },
  { value: "enterprise", label: "Enterprise (5000+ employees)", icon: Building2 },
]

interface ROIFormProps {
  isCalculating: boolean
  onSubmit: (data: ROIParameters) => void
}

export const ROIForm: React.FC<ROIFormProps> = ({ isCalculating, onSubmit }) => {
  const [formData, setFormData] = useState<ROIParameters>({
    companySize: "medium",
    industry: "technology",
    useCase: "process_automation",
    currentProcessTime: 20,
    currentCost: 5000,
    automationPotential: 70,
  })

  const handleInputChange = (field: keyof ROIParameters, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <Select
              value={formData.companySize}
              onValueChange={(value) => handleInputChange("companySize", value as any)}
            >
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
            <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
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
            <Select value={formData.useCase} onValueChange={(value) => handleInputChange("useCase", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USE_CASES.map((useCase) => (
                  <SelectItem key={useCase} value={useCase}>
                    {useCase
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
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
              onChange={(e) => handleInputChange("currentProcessTime", Number(e.target.value))}
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
              onChange={(e) => handleInputChange("currentCost", Number(e.target.value))}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="automationPotential">Automation Potential (%)</Label>
            <Input
              id="automationPotential"
              type="number"
              value={formData.automationPotential}
              onChange={(e) => handleInputChange("automationPotential", Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isCalculating} className="w-full" size="lg">
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
    </form>
  )
}
