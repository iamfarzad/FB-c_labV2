"use client"

import type React from "react"
import { useState } from "react"
import { Calculator } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { useToast } from "@/hooks/use-toast"
import { useChatContext } from "@/app/(chat)/chat/context/ChatProvider"
import { useApiRequest } from "@/hooks/use-api-request"
import { ROIForm } from "./roi-calculator/ROIForm"
import { ROIResults } from "./roi-calculator/ROIResults"
import { ROIEmptyState } from "./roi-calculator/ROIEmptyState"

export interface ROIParameters {
  companySize: "small" | "medium" | "large" | "enterprise"
  industry: string
  useCase: string
  currentProcessTime: number
  currentCost: number
  automationPotential: number
}

export interface ROICalculation {
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

export const ROICalculatorModal: React.FC<ROICalculatorModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast()
  const { addActivity } = useChatContext()
  const [calculation, setCalculation] = useState<ROICalculation | null>(null)

  const { isLoading: isCalculating, execute: calculateROI } = useApiRequest<{ calculation: ROICalculation }>({
    showErrorToast: true,
    errorMessage: "Failed to calculate ROI",
  })

  const handleCalculateROI = async (formData: ROIParameters) => {
    setCalculation(null)

    addActivity({
      type: "ai_request",
      title: "ROI Calculation Started",
      description: `Calculating ROI for ${formData.useCase} in ${formData.industry}`,
      status: "in_progress",
    })

    const result = await calculateROI("/api/calculate-roi", {
      method: "POST",
      body: JSON.stringify(formData),
    })

    if (result?.calculation) {
      setCalculation(result.calculation)

      addActivity({
        type: "complete",
        title: "ROI Calculation Complete",
        description: `Annual savings: $${result.calculation.annualSavings.toLocaleString()}`,
        status: "completed",
      })

      toast({
        title: "ROI Calculation Complete",
        description: `Estimated annual savings: $${result.calculation.annualSavings.toLocaleString()}`,
      })
    } else {
      addActivity({
        type: "error",
        title: "ROI Calculation Failed",
        description: "Failed to calculate ROI",
        status: "failed",
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ROI Calculator"
      description="Calculate the return on investment for AI implementation"
      icon={<Calculator className="h-6 w-6 text-accent" />}
      size="xl"
      contentClassName="p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <ROIForm isCalculating={isCalculating} onSubmit={handleCalculateROI} />

        {/* Results Section */}
        <div className="space-y-6">{calculation ? <ROIResults calculation={calculation} /> : <ROIEmptyState />}</div>
      </div>
    </Modal>
  )
}

export default ROICalculatorModal
