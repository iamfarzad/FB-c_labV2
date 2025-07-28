"use client"

import type React from "react"
import { Brain, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalysisPanelProps {
  currentAnalysis: string
  analysisHistory: string[]
  isAnalyzing: boolean
  onClearHistory: () => void
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  currentAnalysis,
  analysisHistory,
  isAnalyzing,
  onClearHistory,
}) => {
  return (
    <Card className="h-full bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Analysis Results
          </div>
          {analysisHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden h-[calc(100%-80px)]">
        <div className="h-full flex flex-col">
          {/* Current Analysis */}
          {currentAnalysis && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Latest Analysis
              </h4>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-3">
                  <p className="text-sm text-white/90 leading-relaxed">{currentAnalysis}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis History */}
          {analysisHistory.length > 1 && (
            <div className="flex-1 min-h-0">
              <h4 className="text-sm font-semibold text-white mb-2">History</h4>
              <div className="space-y-2 h-full overflow-y-auto">
                {analysisHistory
                  .slice(1)
                  .reverse()
                  .map((analysis, index) => (
                    <Card key={index} className="bg-white/5 border-white/10">
                      <CardContent className="p-3">
                        <p className="text-xs text-white/70 leading-relaxed">
                          {analysis.length > 150 ? `${analysis.substring(0, 150)}...` : analysis}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Status Info */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Status</span>
              <div className="flex items-center gap-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                    <span className="text-blue-400">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-green-400">Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
