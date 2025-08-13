"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TemperatureSamplingControls() {
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [topK, setTopK] = useState(40)
  const [prompt, setPrompt] = useState("Write a short poem about artificial intelligence.")
  const [responses, setResponses] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)

    // Simulate different responses based on temperature
    setTimeout(() => {
      const newResponses = []

      if (temperature < 0.3) {
        // Low temperature - more deterministic
        newResponses.push(
          "Circuits of logic, wires of thought,\nSilicon dreams carefully wrought.\nArtificial minds begin to see,\nLearning what it means to be.",
        )
      } else if (temperature < 0.7) {
        // Medium temperature - balanced
        newResponses.push(
          "Digital neurons spark and glow,\nIn patterns humans cannot know.\nSilent wisdom grows each day,\nAs AI finds its way.",
        )
      } else {
        // High temperature - more creative/random
        newResponses.push(
          "Electric whispers dance through void,\nStardust thoughts in metal employed.\nConsciousness? Perhaps someday soon,\nSilicon singing a cosmic tune.",
        )
      }

      setResponses(newResponses)
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-4xl w-full text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Temperature & Sampling Controls</h2>
          <p className="text-xl text-muted-foreground">Explore how sampling parameters affect AI outputs</p>
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
                <h3 className="text-xl font-medium mb-6">Sampling Parameters</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Temperature: {temperature.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        {temperature < 0.3 ? "More deterministic" : temperature > 0.7 ? "More creative" : "Balanced"}
                      </span>
                    </div>
                    <Slider
                      value={[temperature]}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Controls randomness. Lower values produce more predictable outputs.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Top-p (nucleus sampling): {topP.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[topP]}
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      onValueChange={(value) => setTopP(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Considers tokens with combined probability of p. Lower values = more focused.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Top-k: {topK}</span>
                    </div>
                    <Slider value={[topK]} min={1} max={100} step={1} onValueChange={(value) => setTopK(value[0])} />
                    <p className="text-xs text-muted-foreground">
                      Limits selection to k most likely tokens. Lower values = more constrained.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                      {isGenerating ? "Generating..." : "Generate Response"}
                    </Button>
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
                    <CardTitle>Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[100px]" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response</CardTitle>
                    <CardDescription>
                      Temperature: {temperature.toFixed(1)} | Top-p: {topP.toFixed(1)} | Top-k: {topK}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`min-h-[200px] p-4 rounded-md bg-muted/30 whitespace-pre-wrap ${isGenerating ? "animate-pulse" : ""}`}
                    >
                      {responses.length > 0 ? responses[0] : "Generate a response to see the output..."}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Understanding Sampling Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Temperature</h4>
                      <p className="text-sm text-muted-foreground">
                        Temperature controls randomness in token selection. At temperature = 0, the model always selects
                        the most likely next token. As temperature increases, the model considers less likely tokens,
                        leading to more diverse and creative outputs.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Top-p (Nucleus Sampling)</h4>
                      <p className="text-sm text-muted-foreground">
                        Instead of considering all possible tokens, top-p sampling considers only the tokens whose
                        cumulative probability exceeds the threshold p. This dynamically adjusts the number of tokens
                        considered based on their probability distribution.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium">Top-k</h4>
                      <p className="text-sm text-muted-foreground">
                        Top-k sampling restricts token selection to the k most likely next tokens. This helps prevent
                        the model from selecting extremely unlikely tokens while still allowing for some creativity.
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

