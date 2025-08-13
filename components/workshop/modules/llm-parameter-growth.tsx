"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const modelData = [
  { year: 2018, name: "BERT", parameters: 0.345, description: "Bidirectional Encoder Representations from Transformers", achievements: "Bidirectional context", color: "bg-blue-500/70", architecture: { layers: 24, hiddenSize: 1024, attentionHeads: 16, type: "Encoder-only" } },
  { year: 2019, name: "GPT-2", parameters: 1.5, description: "Generative Pre-trained Transformer 2", achievements: "Coherent paragraphs", color: "bg-purple-500/70", architecture: { layers: 48, hiddenSize: 1600, attentionHeads: 25, type: "Decoder-only" } },
  { year: 2020, name: "GPT-3", parameters: 175, description: "Emergent few-shot learning", achievements: "Few-shot abilities", color: "bg-blue-500/70", architecture: { layers: 96, hiddenSize: 12288, attentionHeads: 96, type: "Decoder-only" } },
  { year: 2021, name: "Gopher", parameters: 280, description: "DeepMind LLM", achievements: "Knowledge tasks", color: "bg-purple-500/70", architecture: { layers: 80, hiddenSize: 16384, attentionHeads: 128, type: "Decoder-only" } },
  { year: 2022, name: "PaLM", parameters: 540, description: "Pathways Language Model", achievements: "Reasoning across languages", color: "bg-blue-500/70", architecture: { layers: 118, hiddenSize: 18432, attentionHeads: 144, type: "Decoder-only" } },
  { year: 2022, name: "Chinchilla", parameters: 70, description: "Compute-optimal training", achievements: "Smaller but better trained", color: "bg-purple-500/70", architecture: { layers: 80, hiddenSize: 8192, attentionHeads: 64, type: "Decoder-only" } },
  { year: 2023, name: "GPT-4", parameters: 1000, description: "Multimodal", achievements: "Human-level performance", color: "bg-blue-500/70", architecture: { layers: 120, hiddenSize: 24576, attentionHeads: 192, type: "Decoder-only" } },
]

export default function LLMParameterGrowth() {
  const [yearIndex, setYearIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedModel, setSelectedModel] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("size")
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentYear = modelData[yearIndex].year
  const visibleModels = modelData.filter((m) => m.year <= currentYear)

  useEffect(() => {
    if (!isPlaying) return
    const startTime = Date.now(); const startIndex = yearIndex
    const animate = () => {
      const elapsed = Date.now() - startTime
      const duration = 5000
      const progress = Math.min(elapsed / duration, 1)
      const idx = Math.min(startIndex + Math.floor(progress * (modelData.length - startIndex)), modelData.length - 1)
      setYearIndex(idx)
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
      else setIsPlaying(false)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [isPlaying, yearIndex])

  useEffect(() => {
    if (activeTab !== "architecture" || !canvasRef.current || selectedModel === null) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d"); if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const width = canvas.width, height = canvas.height, padding = 50
    const inputNodes = 5, hiddenLayers = 3, hiddenNodes = 7, outputNodes = 5
    const nodeRadius = 8, layerSpacing = 150
    const drawNode = (x: number, y: number, color: string) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, nodeRadius, 0, Math.PI * 2); ctx.fill() }
    // input
    const inputX = padding, inputY = height / 2
    for (let i = 0; i < inputNodes; i++) { const y = inputY - ((inputNodes - 1) / 2 - i) * 40; drawNode(inputX, y, "#34d399") }
    // hidden
    for (let layer = 0; layer < hiddenLayers; layer++) {
      const x = padding + layerSpacing * (layer + 1)
      for (let i = 0; i < hiddenNodes; i++) {
        const y = height / 2 - ((hiddenNodes - 1) / 2 - i) * 30
        ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5
        if (layer === 0) { for (let j = 0; j < inputNodes; j++) { const prevY = inputY - ((inputNodes - 1) / 2 - j) * 40; ctx.beginPath(); ctx.moveTo(inputX + nodeRadius, prevY); ctx.lineTo(x - nodeRadius, y); ctx.stroke() } }
        else { for (let j = 0; j < hiddenNodes; j++) { const prevY = height / 2 - ((hiddenNodes - 1) / 2 - j) * 30; const prevX = padding + layerSpacing * layer; ctx.beginPath(); ctx.moveTo(prevX + nodeRadius, prevY); ctx.lineTo(x - nodeRadius, y); ctx.stroke() } }
        drawNode(x, y, "#3b82f6")
      }
    }
    // output
    const outputX = width - padding
    for (let i = 0; i < outputNodes; i++) {
      const y = height / 2 - ((outputNodes - 1) / 2 - i) * 40
      const prevX = padding + layerSpacing * hiddenLayers
      ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.lineWidth = 0.5
      for (let j = 0; j < hiddenNodes; j++) { const prevY = height / 2 - ((hiddenNodes - 1) / 2 - j) * 30; ctx.beginPath(); ctx.moveTo(prevX + nodeRadius, prevY); ctx.lineTo(outputX - nodeRadius, y); ctx.stroke() }
      drawNode(outputX, y, "#ec4899")
    }
  }, [activeTab, canvasRef, selectedModel, visibleModels])

  const maxParameters = Math.max(...modelData.map((m) => (typeof m.parameters === 'number' ? m.parameters : 0)))

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div className="max-w-4xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">LLM Parameter Growth</h2>
          <p className="text-xl text-muted-foreground">Explore how language models have grown in size and capability over time</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="size" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6"><TabsList className="grid grid-cols-2 w-full max-w-md"><TabsTrigger value="size">Size Evolution</TabsTrigger><TabsTrigger value="architecture">Neural Architecture</TabsTrigger></TabsList></div>
            <TabsContent value="size">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div className="bg-card border rounded-xl p-6 shadow-sm h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-medium">Model Size Evolution</h3><div className="text-2xl font-bold">{currentYear}</div></div>
                    <div className="h-[400px] relative mb-6">
                      <div className="absolute inset-y-0 left-0 w-12 flex flex-col justify-between text-xs text-muted-foreground"><span>1000B</span><span>100B</span><span>10B</span><span>1B</span><span>0.1B</span></div>
                      <div className="absolute inset-0 ml-12 flex items-end justify-around">
                        {visibleModels.map((model, index) => {
                          const heightPct = typeof model.parameters === 'number' ? Math.max(5, Math.min(95, 10 + 20 * Math.log10(model.parameters))) : 10
                          const isSelected = selectedModel === index
                          return (
                            <motion.div key={`${model.year}-${model.name}`} className="flex flex-col items-center" initial={{ opacity: 0, height: 0 }} animate={{ opacity: selectedModel === null || isSelected ? 1 : 0.4, height: `${heightPct}%`, scale: isSelected ? 1.05 : 1 }} whileHover={{ scale: isSelected ? 1.05 : 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, delay: index * 0.1 }} onClick={() => setSelectedModel(isSelected ? null : index)} role="button" aria-pressed={isSelected} aria-label={`Select ${model.name} (${model.year})`}>
                              <div className="text-xs text-center mb-1 whitespace-nowrap">{typeof model.parameters === 'number' ? `${model.parameters}B` : model.parameters}</div>
                              <div className={cn("w-12 rounded-t-lg cursor-pointer transition-all", model.color, isSelected ? "ring-2 ring-primary ring-offset-2" : "")} style={{ height: '100%' }} />
                              <div className="text-xs font-medium mt-2 rotate-45 origin-left whitespace-nowrap">{model.name}</div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1"><Slider value={[yearIndex]} min={0} max={modelData.length - 1} step={1} onValueChange={(v) => { setYearIndex(v[0]); setIsPlaying(false) }} /><div className="flex justify-between text-xs text-muted-foreground"><span>2018</span><span>2024</span></div></div>
                      <div className="flex justify-center gap-2">
                        <Button variant={isPlaying ? 'default' : 'outline'} size="sm" onClick={() => { if (isPlaying) setIsPlaying(false); else { if (yearIndex >= modelData.length - 1) setYearIndex(0); setIsPlaying(true) } }}>{isPlaying ? 'Pause' : 'Play Animation'}</Button>
                        <Button variant="outline" size="sm" onClick={() => { setIsPlaying(false); setYearIndex(0); setSelectedModel(null) }}>Reset</Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="bg-card border rounded-xl p-6 shadow-sm h-full">
                    <h3 className="text-xl font-medium mb-4">Model Details</h3>
                    <AnimatePresence mode="wait">
                      {selectedModel !== null ? (
                        <motion.div key={`details-${selectedModel}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                          <div className={cn("w-full h-2 rounded-full", visibleModels[selectedModel].color)} />
                          <div><h4 className="text-lg font-bold">{visibleModels[selectedModel].name} ({visibleModels[selectedModel].year})</h4><p className="text-sm text-muted-foreground">{visibleModels[selectedModel].description}</p></div>
                          <div><div className="text-sm font-medium">Parameters</div><div className="text-2xl font-bold">{typeof visibleModels[selectedModel].parameters === 'number' ? `${visibleModels[selectedModel].parameters} billion` : visibleModels[selectedModel].parameters}</div></div>
                        </motion.div>
                      ) : (
                        <motion.div key="no-selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <p className="text-muted-foreground text-center py-8">Click on a model bar to see details</p>
                          <div><h4 className="font-medium">Current Year: {currentYear}</h4></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="architecture">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div className="bg-card border rounded-xl p-6 shadow-sm h-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-medium">Neural Network Architecture</h3><div className="text-sm text-muted-foreground">{selectedModel !== null ? `${visibleModels[selectedModel].name} (${visibleModels[selectedModel].year})` : 'Select a model to view architecture'}</div></div>
                    <div className="h-[400px] relative mb-6 bg-muted/30 rounded-lg overflow-hidden">{selectedModel === null ? (<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Click a model in Size Evolution</div>) : (<canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />)}</div>
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <div className="bg-card border rounded-xl p-6 shadow-sm h-full"><h3 className="text-xl font-medium mb-4">Architectural Notes</h3><p className="text-sm text-muted-foreground">Transformer models combine self-attention with feed-forward layers. Components include input embeddings, attention heads, and normalization.</p></div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


