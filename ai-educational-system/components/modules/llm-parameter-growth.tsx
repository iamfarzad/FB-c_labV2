"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const modelData = [
  {
    year: 2018,
    name: "BERT",
    parameters: 0.345,
    description: "Bidirectional Encoder Representations from Transformers by Google",
    achievements: "Revolutionized NLP by using bidirectional context",
    color: "bg-blue-500/70",
    architecture: {
      layers: 24,
      hiddenSize: 1024,
      attentionHeads: 16,
      type: "Encoder-only",
    },
  },
  {
    year: 2019,
    name: "GPT-2",
    parameters: 1.5,
    description: "Generative Pre-trained Transformer 2 by OpenAI",
    achievements: "Generated coherent paragraphs of text",
    color: "bg-purple-500/70",
    architecture: {
      layers: 48,
      hiddenSize: 1600,
      attentionHeads: 25,
      type: "Decoder-only",
    },
  },
  {
    year: 2020,
    name: "GPT-3",
    parameters: 175,
    description: "Generative Pre-trained Transformer 3 by OpenAI",
    achievements: "First model to show emergent abilities like few-shot learning",
    color: "bg-blue-500/70",
    architecture: {
      layers: 96,
      hiddenSize: 12288,
      attentionHeads: 96,
      type: "Decoder-only",
    },
  },
  {
    year: 2021,
    name: "Gopher",
    parameters: 280,
    description: "Large language model by DeepMind",
    achievements: "Improved performance on knowledge-intensive tasks",
    color: "bg-purple-500/70",
    architecture: {
      layers: 80,
      hiddenSize: 16384,
      attentionHeads: 128,
      type: "Decoder-only",
    },
  },
  {
    year: 2022,
    name: "PaLM",
    parameters: 540,
    description: "Pathways Language Model by Google",
    achievements: "Demonstrated reasoning capabilities across languages",
    color: "bg-blue-500/70",
    architecture: {
      layers: 118,
      hiddenSize: 18432,
      attentionHeads: 144,
      type: "Decoder-only",
    },
  },
  {
    year: 2022,
    name: "Chinchilla",
    parameters: 70,
    description: "More efficient model by DeepMind",
    achievements: "Showed that smaller models with more training can outperform larger ones",
    color: "bg-purple-500/70",
    architecture: {
      layers: 80,
      hiddenSize: 8192,
      attentionHeads: 64,
      type: "Decoder-only",
    },
  },
  {
    year: 2023,
    name: "GPT-4",
    parameters: 1000,
    description: "Estimated size of OpenAI's GPT-4",
    achievements: "Multimodal capabilities and human-level performance on many tasks",
    color: "bg-blue-500/70",
    architecture: {
      layers: 120,
      hiddenSize: 24576,
      attentionHeads: 192,
      type: "Decoder-only",
    },
  },
  {
    year: 2023,
    name: "Llama 2",
    parameters: 70,
    description: "Open model by Meta",
    achievements: "Competitive performance in an open-source model",
    color: "bg-purple-500/70",
    architecture: {
      layers: 80,
      hiddenSize: 8192,
      attentionHeads: 64,
      type: "Decoder-only",
    },
  },
  {
    year: 2024,
    name: "Claude 3",
    parameters: "Unknown",
    description: "Anthropic's latest model",
    achievements: "Advanced reasoning and reduced hallucinations",
    color: "bg-green-500/70",
    architecture: {
      layers: "Unknown",
      hiddenSize: "Unknown",
      attentionHeads: "Unknown",
      type: "Decoder-only (presumed)",
    },
  },
]

export default function LLMParameterGrowth() {
  const [yearIndex, setYearIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedModel, setSelectedModel] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("size")
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const currentYear = modelData[yearIndex].year
  const visibleModels = modelData.filter((model) => model.year <= currentYear)

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now()
      const startIndex = yearIndex

      const animate = () => {
        const elapsedTime = Date.now() - startTime
        const duration = 5000 // 5 seconds to go through all models
        const progress = Math.min(elapsedTime / duration, 1)
        const targetIndex = Math.min(
          startIndex + Math.floor(progress * (modelData.length - startIndex)),
          modelData.length - 1,
        )

        setYearIndex(targetIndex)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsPlaying(false)
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [isPlaying, yearIndex])

  // Draw neural network visualization
  useEffect(() => {
    if (activeTab !== "architecture" || !canvasRef.current || selectedModel === null) return

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set up dimensions
      const width = canvas.width
      const height = canvas.height
      const padding = 50

      // Calculate number of nodes to show (simplified version)
      const inputNodes = 5
      const hiddenLayers = 3
      const hiddenNodesPerLayer = 7
      const outputNodes = 5

      const nodeRadius = 8
      const layerSpacing = 150

      // Draw input layer
      const inputY = height / 2
      const inputX = padding
      ctx.fillStyle = "#34d399" // Green
      for (let i = 0; i < inputNodes; i++) {
        const y = inputY - ((inputNodes - 1) / 2 - i) * 40
        ctx.beginPath()
        ctx.arc(inputX, y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Label
        if (i === 0) {
          ctx.fillStyle = "#000"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("Input", inputX, height - 20)
          ctx.fillStyle = "#34d399"
        }
      }

      // Draw hidden layers
      for (let layer = 0; layer < hiddenLayers; layer++) {
        const x = padding + layerSpacing * (layer + 1)

        // Label
        if (layer === 1) {
          ctx.fillStyle = "#000"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("Hidden Layers", x, height - 20)
        }

        ctx.fillStyle = "#3b82f6" // Blue

        for (let i = 0; i < hiddenNodesPerLayer; i++) {
          const y = height / 2 - ((hiddenNodesPerLayer - 1) / 2 - i) * 30

          // Draw connections to previous layer
          ctx.strokeStyle = "rgba(0,0,0,0.1)"
          ctx.lineWidth = 0.5

          if (layer === 0) {
            // Connect to input layer
            for (let j = 0; j < inputNodes; j++) {
              const prevY = inputY - ((inputNodes - 1) / 2 - j) * 40
              ctx.beginPath()
              ctx.moveTo(inputX + nodeRadius, prevY)
              ctx.lineTo(x - nodeRadius, y)
              ctx.stroke()
            }
          } else {
            // Connect to previous hidden layer
            for (let j = 0; j < hiddenNodesPerLayer; j++) {
              const prevY = height / 2 - ((hiddenNodesPerLayer - 1) / 2 - j) * 30
              const prevX = padding + layerSpacing * layer
              ctx.beginPath()
              ctx.moveTo(prevX + nodeRadius, prevY)
              ctx.lineTo(x - nodeRadius, y)
              ctx.stroke()
            }
          }

          // Draw node
          ctx.beginPath()
          ctx.arc(x, y, nodeRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw output layer
      const outputX = width - padding
      ctx.fillStyle = "#ec4899" // Pink
      for (let i = 0; i < outputNodes; i++) {
        const y = height / 2 - ((outputNodes - 1) / 2 - i) * 40

        // Draw connections from last hidden layer
        ctx.strokeStyle = "rgba(0,0,0,0.1)"
        ctx.lineWidth = 0.5

        for (let j = 0; j < hiddenNodesPerLayer; j++) {
          const prevY = height / 2 - ((hiddenNodesPerLayer - 1) / 2 - j) * 30
          const prevX = padding + layerSpacing * hiddenLayers
          ctx.beginPath()
          ctx.moveTo(prevX + nodeRadius, prevY)
          ctx.lineTo(outputX - nodeRadius, y)
          ctx.stroke()
        }

        // Draw node
        ctx.beginPath()
        ctx.arc(outputX, y, nodeRadius, 0, Math.PI * 2)
        ctx.fill()

        // Label
        if (i === 0) {
          ctx.fillStyle = "#000"
          ctx.font = "14px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("Output", outputX, height - 20)
          ctx.fillStyle = "#ec4899"
        }
      }

      // Ensure model is defined before using it
      const model = visibleModels[selectedModel]

      // Draw model info
      if (model) {
        ctx.fillStyle = "#000"
        ctx.font = "bold 16px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(
          `${model.name} (${model.year}) - ${typeof model.parameters === "number" ? model.parameters + "B" : model.parameters} parameters`,
          width / 2,
          30,
        )

        // Draw architecture details
        ctx.font = "14px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(`Layers: ${model.architecture.layers}`, 20, 60)
        ctx.fillText(`Hidden Size: ${model.architecture.hiddenSize}`, 20, 80)
        ctx.fillText(`Attention Heads: ${model.architecture.attentionHeads}`, 20, 100)
        ctx.fillText(`Type: ${model.architecture.type}`, 20, 120)
      }

      // Draw formula
      ctx.font = "italic 14px sans-serif"
      ctx.fillText("σ(wx + b)", width / 2 - 40, 70)
    } catch (error) {
      console.error("Error rendering neural network visualization:", error)
    }
  }, [activeTab, canvasRef, selectedModel, visibleModels])

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      // If we're at the end, reset to beginning before playing
      if (yearIndex >= modelData.length - 1) {
        setYearIndex(0)
      }
      setIsPlaying(true)
    }
  }

  const reset = () => {
    setIsPlaying(false)
    setYearIndex(0)
    setSelectedModel(null)
    setShowDetails(false)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // If switching to architecture tab and no model is selected, select the first visible model
    if (value === "architecture" && selectedModel === null && visibleModels.length > 0) {
      setSelectedModel(0)
    }
  }

  // Calculate max parameters for scaling
  const maxParameters = Math.max(
    ...modelData.filter((model) => typeof model.parameters === "number").map((model) => model.parameters as number),
  )

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-4xl w-full text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">LLM Parameter Growth</h2>
          <p className="text-xl text-muted-foreground">
            Explore how language models have grown in size and capability over time
          </p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <Tabs defaultValue="size" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md" aria-label="View options">
                <TabsTrigger value="size" aria-controls="size-tab-content">
                  Size Evolution
                </TabsTrigger>
                <TabsTrigger value="architecture" aria-controls="architecture-tab-content">
                  Neural Architecture
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="size">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div
                    className="bg-card border rounded-xl p-6 shadow-sm h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-medium">Model Size Evolution</h3>
                      <div className="text-2xl font-bold">{currentYear}</div>
                    </div>

                    <div className="h-[400px] relative mb-6">
                      <div className="absolute inset-y-0 left-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                        <span>1000B</span>
                        <span>100B</span>
                        <span>10B</span>
                        <span>1B</span>
                        <span>0.1B</span>
                      </div>

                      <div className="absolute inset-0 ml-12 flex items-end justify-around">
                        {visibleModels.map((model, index) => {
                          // Calculate height based on parameters (log scale)
                          const heightPercentage =
                            typeof model.parameters === "number"
                              ? Math.max(5, Math.min(95, 10 + 20 * Math.log10(model.parameters)))
                              : 10 // Default height for unknown

                          const isSelected = selectedModel === index

                          return (
                            <motion.div
                              key={`${model.year}-${model.name}`}
                              className="flex flex-col items-center"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{
                                opacity: selectedModel === null || isSelected ? 1 : 0.4,
                                height: `${heightPercentage}%`,
                                scale: isSelected ? 1.05 : 1,
                              }}
                              whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              onClick={() => setSelectedModel(isSelected ? null : index)}
                              role="button"
                              aria-pressed={isSelected}
                              aria-label={`Select ${model.name} (${model.year})`}
                            >
                              <div className="text-xs text-center mb-1 whitespace-nowrap">
                                {typeof model.parameters === "number" ? `${model.parameters}B` : model.parameters}
                              </div>
                              <div
                                className={cn(
                                  "w-12 rounded-t-lg cursor-pointer transition-all",
                                  model.color,
                                  isSelected ? "ring-2 ring-primary ring-offset-2" : "",
                                )}
                                style={{ height: "100%" }}
                              />
                              <div className="text-xs font-medium mt-2 rotate-45 origin-left whitespace-nowrap">
                                {model.name}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Slider
                          value={[yearIndex]}
                          min={0}
                          max={modelData.length - 1}
                          step={1}
                          onValueChange={(value) => {
                            setYearIndex(value[0])
                            setIsPlaying(false)
                          }}
                          disabled={isPlaying}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>2018</span>
                          <span>2024</span>
                        </div>
                      </div>

                      <div className="flex justify-center gap-2">
                        <Button
                          variant={isPlaying ? "default" : "outline"}
                          size="sm"
                          onClick={togglePlayPause}
                          className="transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          {isPlaying ? "Pause" : "Play Animation"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={reset}
                          className="transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="bg-card border rounded-xl p-6 shadow-sm h-full">
                    <h3 className="text-xl font-medium mb-4">Model Details</h3>

                    <AnimatePresence mode="wait">
                      {selectedModel !== null ? (
                        <motion.div
                          key={`details-${selectedModel}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4"
                        >
                          <div className={cn("w-full h-2 rounded-full", visibleModels[selectedModel].color)} />

                          <div>
                            <h4 className="text-lg font-bold">
                              {visibleModels[selectedModel].name} ({visibleModels[selectedModel].year})
                            </h4>
                            <p className="text-sm text-muted-foreground">{visibleModels[selectedModel].description}</p>
                          </div>

                          <div>
                            <div className="text-sm font-medium">Parameters</div>
                            <div className="text-2xl font-bold">
                              {typeof visibleModels[selectedModel].parameters === "number"
                                ? `${visibleModels[selectedModel].parameters} billion`
                                : visibleModels[selectedModel].parameters}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium">Architecture</div>
                            <ul className="text-sm space-y-1 mt-1">
                              <li>
                                <span className="font-medium">Layers:</span>{" "}
                                {visibleModels[selectedModel].architecture.layers}
                              </li>
                              <li>
                                <span className="font-medium">Hidden Size:</span>{" "}
                                {visibleModels[selectedModel].architecture.hiddenSize}
                              </li>
                              <li>
                                <span className="font-medium">Attention Heads:</span>{" "}
                                {visibleModels[selectedModel].architecture.attentionHeads}
                              </li>
                              <li>
                                <span className="font-medium">Type:</span>{" "}
                                {visibleModels[selectedModel].architecture.type}
                              </li>
                            </ul>
                          </div>

                          <div>
                            <div className="text-sm font-medium">Key Achievements</div>
                            <p className="text-sm">{visibleModels[selectedModel].achievements}</p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="no-selection"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-4"
                        >
                          <p className="text-muted-foreground text-center py-8">Click on a model bar to see details</p>

                          <div>
                            <h4 className="font-medium">Current Year: {currentYear}</h4>
                            <p className="text-sm text-muted-foreground mt-2">
                              {currentYear < 2020
                                ? "Early LLMs were relatively small but laid important foundations."
                                : currentYear < 2022
                                  ? "Models grew dramatically in size, leading to new capabilities."
                                  : "Recent models focus on efficiency and specialized abilities."}
                            </p>
                          </div>

                          <div className="text-sm space-y-2">
                            <div className="font-medium">Models visible: {visibleModels.length}</div>
                            <div>
                              Latest: {visibleModels[visibleModels.length - 1].name}(
                              {typeof visibleModels[visibleModels.length - 1].parameters === "number"
                                ? `${visibleModels[visibleModels.length - 1].parameters}B parameters`
                                : visibleModels[visibleModels.length - 1].parameters}
                              )
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: showDetails ? "auto" : 0,
                        opacity: showDetails ? 1 : 0,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t space-y-4">
                        <div>
                          <h4 className="font-medium">What are parameters?</h4>
                          <p className="text-sm text-muted-foreground">
                            Parameters are the weights and biases in a neural network that are learned during training.
                            More parameters generally allow models to learn more complex patterns, but require more
                            data, compute, and can lead to overfitting.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium">Scaling laws</h4>
                          <p className="text-sm text-muted-foreground">
                            Research has shown that model performance scales predictably with model size, dataset size,
                            and compute. However, recent work suggests that efficient training and high-quality data may
                            be more important than raw size.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-sm flex items-center text-blue-500 mt-4"
                    >
                      {showDetails ? "Show less" : "Learn more about parameters"}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className={`ml-1 transition-transform ${showDetails ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="architecture">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div
                    className="bg-card border rounded-xl p-6 shadow-sm h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-medium">Neural Network Architecture</h3>
                      <div className="text-sm text-muted-foreground">
                        {selectedModel !== null
                          ? `${visibleModels[selectedModel].name} (${visibleModels[selectedModel].year})`
                          : "Select a model to view architecture"}
                      </div>
                    </div>

                    <div className="h-[400px] relative mb-6 bg-muted/30 rounded-lg overflow-hidden">
                      {selectedModel === null ? (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          Click on a model in the Size Evolution tab to view its architecture
                        </div>
                      ) : (
                        <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">How Transformer Models Work</h4>
                        <p className="text-sm text-muted-foreground">
                          Transformer models consist of multiple layers of self-attention mechanisms and feed-forward
                          neural networks. Each node in the network processes information from the previous layer,
                          applying weights and biases through an activation function (σ). The formula σ(wx + b)
                          represents how each neuron transforms its input.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium">Key Components:</h5>
                            <ul className="list-disc pl-5 text-xs text-muted-foreground mt-1 space-y-1">
                              <li>Input Embeddings: Convert tokens to vectors</li>
                              <li>Attention Heads: Focus on relevant context</li>
                              <li>Feed-Forward Networks: Process information</li>
                              <li>Layer Normalization: Stabilize learning</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium">Architecture Types:</h5>
                            <ul className="list-disc pl-5 text-xs text-muted-foreground mt-1 space-y-1">
                              <li>Encoder-only: BERT (bidirectional)</li>
                              <li>Decoder-only: GPT models (autoregressive)</li>
                              <li>Encoder-Decoder: T5, BART (sequence-to-sequence)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="bg-card border rounded-xl p-6 shadow-sm h-full">
                    <h3 className="text-xl font-medium mb-4">Architectural Evolution</h3>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium">Scaling Strategies</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          As models grew from millions to billions of parameters, researchers developed various scaling
                          strategies:
                        </p>
                        <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                          <li>
                            <span className="font-medium">Depth scaling:</span>{" "}
                            <span className="text-muted-foreground">Adding more layers</span>
                          </li>
                          <li>
                            <span className="font-medium">Width scaling:</span>{" "}
                            <span className="text-muted-foreground">Increasing hidden dimensions</span>
                          </li>
                          <li>
                            <span className="font-medium">Attention scaling:</span>{" "}
                            <span className="text-muted-foreground">More attention heads</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Architectural Innovations</h4>
                        <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                          <li>
                            <span className="font-medium">Sparse Attention:</span>{" "}
                            <span className="text-muted-foreground">
                              Efficient attention patterns that reduce computation
                            </span>
                          </li>
                          <li>
                            <span className="font-medium">Mixture of Experts:</span>{" "}
                            <span className="text-muted-foreground">
                              Activating only parts of the network for each input
                            </span>
                          </li>
                          <li>
                            <span className="font-medium">Flash Attention:</span>{" "}
                            <span className="text-muted-foreground">
                              Optimized attention algorithms for faster processing
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Computational Requirements</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          The computational resources needed to train these models have grown exponentially:
                        </p>
                        <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                          <li>BERT (2018): Trained on 16 TPUs for 4 days</li>
                          <li>GPT-3 (2020): Estimated 3,640 petaflop-days of compute</li>
                          <li>GPT-4 (2023): Likely hundreds of thousands of GPU hours</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

