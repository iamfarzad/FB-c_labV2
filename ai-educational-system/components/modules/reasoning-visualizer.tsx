"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react"

const reasoningExamples = [
  {
    id: "math",
    name: "Mathematical Reasoning",
    problem:
      "If a shirt originally costs $80 and is on sale for 25% off, and then there is an additional 10% discount at checkout, what is the final price of the shirt?",
    steps: [
      "Let's solve this step-by-step.",
      "First, I'll calculate the price after the 25% discount.",
      "25% off means the customer pays 75% of the original price.",
      "75% of $80 = 0.75 × $80 = $60",
      "Now, I need to apply the additional 10% discount to the $60 price.",
      "10% off means the customer pays 90% of the $60 price.",
      "90% of $60 = 0.9 × $60 = $54",
      "Therefore, the final price of the shirt after both discounts is $54.",
    ],
  },
  {
    id: "logic",
    name: "Logical Reasoning",
    problem: "All mammals are warm-blooded. All whales are mammals. Are all whales warm-blooded?",
    steps: [
      "Let's analyze this logical syllogism step-by-step.",
      "We have two premises:",
      "Premise 1: All mammals are warm-blooded.",
      "Premise 2: All whales are mammals.",
      "I need to determine if the conclusion 'All whales are warm-blooded' follows logically.",
      "From Premise 2, we know that whales belong to the set of mammals.",
      "From Premise 1, we know that all members of the set of mammals are warm-blooded.",
      "Since whales are members of the set of mammals, and all mammals are warm-blooded, it logically follows that all whales must be warm-blooded.",
      "Therefore, the conclusion 'All whales are warm-blooded' is valid and true.",
    ],
  },
  {
    id: "causal",
    name: "Causal Reasoning",
    problem:
      "A city implemented a new traffic law and saw accident rates decline by 15% the following year. Did the new law cause the reduction in accidents?",
    steps: [
      "Let's analyze this causal relationship carefully.",
      "We have an observation: After implementing a new traffic law, accident rates declined by 15%.",
      "The question asks if we can conclude that the law caused the reduction.",
      "To establish causation, we need to consider several factors:",
      "1. Temporal sequence: The law came before the reduction, which is consistent with causation.",
      "2. Correlation: There is a correlation between the law and accident reduction.",
      "3. Alternative explanations: We need to consider other factors that might explain the reduction:",
      "   - Were there other safety initiatives implemented during the same period?",
      "   - Were there changes in weather patterns, traffic volume, or road conditions?",
      "   - Was there a general downward trend in accidents before the law?",
      "   - Were there demographic changes in the driving population?",
      "4. Mechanism: We don't know the specific mechanism by which the law might have reduced accidents.",
      "Without controlling for these alternative explanations, we cannot conclusively state that the law caused the reduction.",
      "This is a classic example of the principle that 'correlation does not imply causation.'",
      "To establish causation more confidently, we would need a controlled study or natural experiment that accounts for confounding variables.",
      "Therefore, based on the information provided, we cannot conclude that the new law definitely caused the reduction in accidents, though it remains a possibility.",
    ],
  },
]

export default function ReasoningVisualizer() {
  const [activeTab, setActiveTab] = useState("math")
  const [problem, setProblem] = useState(reasoningExamples[0].problem)
  const [steps, setSteps] = useState(reasoningExamples[0].steps)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [customProblem, setCustomProblem] = useState("")

  useEffect(() => {
    // Reset state when changing tabs
    const example = reasoningExamples.find((ex) => ex.id === activeTab)
    if (example) {
      setProblem(example.problem)
      setSteps(example.steps)
      setCurrentStep(0)
      setIsPlaying(false)
    }
  }, [activeTab])

  useEffect(() => {
    // Auto-advance steps when playing
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 2000 / playbackSpeed)

      return () => clearTimeout(timer)
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, steps.length, playbackSpeed])

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
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
          <h2 className="text-3xl font-bold mb-4">Chain-of-Thought Reasoning Viewer</h2>
          <p className="text-xl text-muted-foreground">Visualize how LLMs solve complex reasoning tasks step by step</p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <Tabs defaultValue="math" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-xl">
                <TabsTrigger value="math">Mathematical</TabsTrigger>
                <TabsTrigger value="logic">Logical</TabsTrigger>
                <TabsTrigger value="causal">Causal</TabsTrigger>
              </TabsList>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Problem</CardTitle>
                    <CardDescription>
                      {activeTab === "math" && "Mathematical reasoning task"}
                      {activeTab === "logic" && "Logical reasoning task"}
                      {activeTab === "causal" && "Causal reasoning task"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-md">{problem}</div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Playback Speed: {playbackSpeed}x</span>
                      </div>
                      <Slider
                        value={[playbackSpeed]}
                        min={0.5}
                        max={2}
                        step={0.5}
                        onValueChange={(value) => setPlaybackSpeed(value[0])}
                        disabled={isPlaying}
                      />
                    </div>

                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" onClick={handleReset} disabled={currentStep === 0}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>

                      {isPlaying ? (
                        <Button variant="outline" size="icon" onClick={handlePause}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePlay}
                          disabled={currentStep >= steps.length - 1}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSkip}
                        disabled={currentStep >= steps.length - 1}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      Step {currentStep + 1} of {steps.length}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Chain-of-Thought Process</CardTitle>
                    <CardDescription>Watch the reasoning unfold step by step</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-md min-h-[400px] relative">
                      <div className="space-y-4">
                        {steps.slice(0, currentStep + 1).map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className={`p-3 rounded-md ${
                              index === currentStep ? "bg-primary/10 border border-primary/20" : ""
                            }`}
                          >
                            {step}
                          </motion.div>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="absolute bottom-4 left-4 right-4 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Tabs>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Understanding Chain-of-Thought Reasoning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">What is Chain-of-Thought?</h4>
                    <p className="text-sm text-muted-foreground">
                      Chain-of-Thought (CoT) is a prompting technique that encourages language models to break down
                      complex problems into intermediate steps before arriving at a final answer. This process mimics
                      human reasoning and significantly improves performance on tasks requiring multi-step thinking.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Benefits</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Improves accuracy on complex problems</li>
                      <li>Makes reasoning transparent and interpretable</li>
                      <li>Reduces "hallucinations" and logical errors</li>
                      <li>Allows humans to follow the model's reasoning</li>
                      <li>Enables identification of specific error points</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Applications</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Mathematical problem-solving</li>
                      <li>Logical reasoning and deduction</li>
                      <li>Causal analysis</li>
                      <li>Multi-step planning</li>
                      <li>Complex decision-making</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <h4 className="font-medium mb-2">How to Prompt for Chain-of-Thought</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="font-medium text-sm mb-1">Standard Prompt:</div>
                      <div className="text-sm text-muted-foreground">"What is 17 × 28?"</div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="font-medium text-sm mb-1">Chain-of-Thought Prompt:</div>
                      <div className="text-sm text-muted-foreground">
                        "What is 17 × 28? Let's work through this step by step."
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

