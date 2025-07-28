"use client"

import type React from "react"
import { TrendingUp, Clock, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ROICalculation } from "../ROICalculatorModal"

interface ROIResultsProps {
  calculation: ROICalculation
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

export const ROIResults: React.FC<ROIResultsProps> = ({ calculation }) => {
  return (
    <div className="space-y-6">
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
              <div className="text-2xl font-bold text-green-600">${calculation.annualSavings.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Annual Savings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{calculation.roiPercentage}%</div>
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
    </div>
  )
}
