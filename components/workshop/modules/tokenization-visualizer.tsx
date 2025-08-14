"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function simulateTokenization(text: string): string[] {
  return text
    .trim()
    .split(/(\s+|\b)/)
    .filter(Boolean)
}

export default function TokenizationVisualizer() {
  const [text, setText] = useState('Hello world! How does tokenization work?')
  const [tokens, setTokens] = useState<string[]>(simulateTokenization('Hello world! How does tokenization work?'))
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleTokenize = () => { setTokens(simulateTokenization(text)) }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <motion.div className="max-w-3xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
        <div className="w-full max-w-3xl mt-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick check</CardTitle>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <div className="space-y-4">
                  <div className="text-sm">What is a token in this context?</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { key: 'a', label: 'A unit of currency' },
                      { key: 'b', label: 'A piece of text (word, subword, character)' },
                      { key: 'c', label: 'A GPU type' },
                      { key: 'd', label: 'A JSON Web Token' },
                    ].map(opt => (
                      <Button key={opt.key} variant={quizAnswer === opt.key ? 'default' : 'outline'} onClick={() => setQuizAnswer(opt.key)} className="justify-start">
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button disabled={!quizAnswer} onClick={() => { setIsSubmitted(true) }}>
                      Submit
                    </Button>
                    <Button variant="ghost" onClick={() => { setQuizAnswer(null); setIsSubmitted(false) }}>Reset</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {quizAnswer === 'b' ? (
                    <div className="text-green-600">Correct — tokens are units of text the model processes.</div>
                  ) : (
                    <div className="text-red-600">Not quite. A token here is a small piece of text (like a word or subword).</div>
                  )}
                  <Button className="mt-2" onClick={() => setShowQuiz(false)}>Close</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


