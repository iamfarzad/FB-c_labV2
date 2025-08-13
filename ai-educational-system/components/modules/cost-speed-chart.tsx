"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Sample model data
const modelData = [
  { name: "GPT-3.5 Turbo", parameters: 175, tokensPerSecond: 40, costPer1KTokens: 0.002, color: "#34d399" },
  { name: "GPT-4", parameters: 1000, tokensPerSecond: 15, costPer1KTokens: 0.06, color: "#3b82f6" },
  { name: "Claude 2", parameters: 137, tokensPerSecond: 20, costPer1KTokens: 0.008, color: "#a855f7" },
  { name: "Llama 2 (70B)", parameters: 70, tokensPerSecond: 30, costPer1KTokens: 0.001, color: "#f97316" },
  { name: "Mistral 7B", parameters: 7, tokensPerSecond: 45, costPer1KTokens: 0.0005, color: "#ec4899" },
]

export default function CostSpeedChart() {
  const [selectedModels, setSelectedModels] = useState(["GPT-3.5 Turbo", "GPT-4", "Llama 2 (70B)"])
  const [inputTokens, setInputTokens] = useState(1000)
  const [outputTokens, setOutputTokens] = useState(500)
  const [showParameters, setShowParameters] = useState(true)
  const [showSpeed, setShowSpeed] = useState(true)
  const [showCost, setShowCost] = useState(true)

  // Calculate metrics for selected models
  const modelMetrics = selectedModels
    .map((modelName) => {
      const model = modelData.find((m) => m.name === modelName)
      if (!model) return null

      const totalTokens = inputTokens + outputTokens
      const inferenceTime = outputTokens / model.tokensPerSecond
      const totalCost = (inputTokens * model.costPer1KTokens) / 1000 + (outputTokens * model.costPer1KTokens) / 1000

      return {
        ...model,
        inferenceTime,
        totalCost,
      }
    })
    .filter(Boolean)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-4xl w-full text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">LLM Cost & Speed Comparison</h2>
          <p className="text-xl text-muted-foreground">Visualize the tradeoffs between model size, speed, and cost</p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <motion.div
                className="bg-card border rounded-xl p-6 shadow-sm h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl font-medium mb-6">Comparison Settings</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Models</label>
                    <div className="space-y-2">
                      {modelData.map((model) => (
                        <div key={model.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`model-${model.name}`}
                            checked={selectedModels.includes(model.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedModels([...selectedModels, model.name])
                              } else {
                                setSelectedModels(selectedModels.filter((m) => m !== model.name))
                              }
                            }}
                          />
                          <label htmlFor={`model-${model.name}`} className="text-sm flex items-center">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: model.color }}
                            ></span>
                            {model.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Input Tokens: {inputTokens.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[inputTokens]}
                      min={100}
                      max={10000}
                      step={100}
                      onValueChange={(value) => setInputTokens(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Output Tokens: {outputTokens.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[outputTokens]}
                      min={100}
                      max={5000}
                      step={100}
                      onValueChange={(value) => setOutputTokens(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Display Metrics</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="show-parameters" checked={showParameters} onCheckedChange={setShowParameters} />
                        <Label htmlFor="show-parameters">Model Size (Parameters)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-speed" checked={showSpeed} onCheckedChange={setShowSpeed} />
                        <Label htmlFor="show-speed">Speed (Inference Time)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="show-cost" checked={showCost} onCheckedChange={setShowCost} />
                        <Label htmlFor="show-cost">Cost</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Comparison Chart</CardTitle>
                    <CardDescription>
                      Input: {inputTokens.toLocaleString()} tokens | Output: {outputTokens.toLocaleString()} tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] bg-muted/30 rounded-md p-4 relative">
                      {/* This would be a real chart in a production implementation */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          Interactive chart visualization would appear here
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Model Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Model</th>
                            {showParameters && <th className="text-right py-2">Parameters</th>}
                            {showSpeed && <th className="text-right py-2">Inference Time</th>}
                            {showCost && <th className="text-right py-2">Cost</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {modelMetrics.map((model) => (
                            <tr key={model.name} className="border-b">
                              <td className="py-3">
                                <div className="flex items-center">
                                  <span
                                    className="inline-block w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: model.color }}
                                  ></span>
                                  {model.name}
                                </div>
                              </td>
                              {showParameters && <td className="text-right py-3">{model.parameters}B</td>}
                              {showSpeed && <td className="text-right py-3">{model.inferenceTime.toFixed(2)}s</td>}
                              {showCost && <td className="text-right py-3">${model.totalCost.toFixed(4)}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Model Size vs. Speed</h4>
                      <p className="text-sm text-muted-foreground">
                        Larger models (more parameters) generally have slower inference times. For example, GPT-4 with 1
                        trillion parameters is significantly slower than smaller models like Mistral 7B.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Cost Considerations</h4>
                      <p className="text-sm text-muted-foreground">
                        Proprietary models like GPT-4 are typically more expensive than open-source alternatives. For
                        high-volume applications, this cost difference can be substantial.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Choosing the Right Model</h4>
                      <p className="text-sm text-muted-foreground">
                        The best model depends on your specific requirements. For real-time applications, prioritize
                        speed. For complex reasoning, larger models may be worth the cost and latency.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

