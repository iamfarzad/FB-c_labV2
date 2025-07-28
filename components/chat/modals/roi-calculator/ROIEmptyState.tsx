"use client"

import type React from "react"
import { Calculator } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const ROIEmptyState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Fill out the form and click "Calculate ROI" to see your results</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8 text-muted-foreground">
        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No calculation yet</p>
      </CardContent>
    </Card>
  )
}
