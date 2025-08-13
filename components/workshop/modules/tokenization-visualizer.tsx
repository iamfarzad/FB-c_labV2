"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

function simulateTokenization(text: string): string[] {
  return text
    .trim()
    .split(/(\s+|\b)/)
    .filter(Boolean)
}

export default function TokenizationVisualizer() {
  const [text, setText] = useState('Hello world! How does tokenization work?')
  const [tokens, setTokens] = useState<string[]>(simulateTokenization('Hello world! How does tokenization work?'))

  const handleTokenize = () => { setTokens(simulateTokenization(text)) }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div className="max-w-4xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">Tokenization Visualizer</h2>
          <p className="text-xl text-muted-foreground">See how text splits into tokens and fills a context window</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[200px]" />
              <Button onClick={handleTokenize} className="w-full">Tokenize</Button>
            </motion.div>
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {tokens.map((tok, i) => (
                    <span key={`${tok}-${i}`} className="px-2 py-1 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 text-sm border border-blue-500/30">{tok}</span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">Tokens: {tokens.length} • Approx. chars: {text.length}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}


