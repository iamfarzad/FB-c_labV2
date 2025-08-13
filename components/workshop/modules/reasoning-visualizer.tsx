"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export default function ReasoningVisualizer() {
  const steps = [
    'Restate the problem in own words',
    'Identify knowns and unknowns',
    'Plan sub-steps',
    'Execute computation or lookup',
    'Check and summarize answer'
  ]
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => { setIsPlaying(true); const t = setInterval(() => setIndex((i) => { if (i >= steps.length - 1) { clearInterval(t); setIsPlaying(false); return i } return i + 1 }), 700) }
  const handlePause = () => setIsPlaying(false)
  const handleReset = () => { setIsPlaying(false); setIndex(0) }
  const handleSkip = () => setIndex((i) => Math.min(steps.length - 1, i + 1))

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div className="max-w-4xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">Reasoning Visualizer</h2>
          <p className="text-xl text-muted-foreground">Step through a simple reasoning chain</p>
        </motion.div>
        <div className="w-full max-w-xl bg-card border rounded-xl p-6 shadow-sm">
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={s} className={`p-3 rounded border ${i === index ? 'bg-primary/10 border-primary' : 'bg-muted/20'}`}>{i + 1}. {s}</li>
            ))}
          </ol>
          <div className="flex gap-2 mt-6 justify-center">
            <Button size="sm" onClick={handlePlay} disabled={isPlaying}>Play</Button>
            <Button size="sm" variant="outline" onClick={handlePause}>Pause</Button>
            <Button size="sm" variant="outline" onClick={handleSkip}>Skip</Button>
            <Button size="sm" variant="outline" onClick={handleReset}>Reset</Button>
          </div>
        </div>
      </div>
    </div>
  )
}


