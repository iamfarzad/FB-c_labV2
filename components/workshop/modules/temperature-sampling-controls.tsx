"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export default function TemperatureSamplingControls() {
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(1)
  const [topK, setTopK] = useState(40)
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('The quick brown fox jumps over the lazy dog.')

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const base = 'The quick brown fox jumps over the lazy dog.'
      const noisy = temperature > 0.9 ? 'The nimble azure fox vaults past the languid hound.' : base
      setOutput(noisy)
      setIsGenerating(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div className="max-w-4xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">Temperature & Sampling</h2>
          <p className="text-xl text-muted-foreground">Explore how decoding settings affect generation</p>
        </motion.div>
        <div className="w-full max-w-3xl bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Temperature</span><span>{temperature.toFixed(2)}</span></div>
            <Slider value={[temperature]} min={0} max={1.5} step={0.05} onValueChange={(v) => setTemperature(v[0])} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Top‑p</span><span>{topP.toFixed(2)}</span></div>
            <Slider value={[topP]} min={0.1} max={1} step={0.05} onValueChange={(v) => setTopP(v[0])} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Top‑k</span><span>{topK}</span></div>
            <Slider value={[topK]} min={0} max={100} step={5} onValueChange={(v) => setTopK(v[0])} />
          </div>
          <div className="space-y-2">
            <div className={`min-h-[120px] p-4 rounded-md bg-muted/30 whitespace-pre-wrap ${isGenerating ? 'animate-pulse' : ''}`}>{output}</div>
            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>{isGenerating ? 'Generating…' : 'Generate Sample'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


