"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

// Simplified tokenization simulation
function simulateTokenization(text: string) {
  // This is a simplified simulation of how tokenization works
  // Real tokenizers use more complex algorithms like BPE

  if (!text.trim()) return []

  // Split on spaces and punctuation
  const rawTokens = text.split(/([.,!?;:"\s])/g).filter((t) => t !== "")

  // Simulate subword tokenization for common prefixes/suffixes
  const tokens: { text: string; cost: number; type: string }[] = []

  rawTokens.forEach((token) => {
    // Handle common prefixes/suffixes to simulate subword tokenization
    if (token.length > 5 && !token.match(/[.,!?;:"\s]/)) {
      // Simulate breaking longer words into subwords
      const firstPart = token.substring(0, Math.ceil(token.length / 2))
      const secondPart = token.substring(Math.ceil(token.length / 2))
      tokens.push({ text: firstPart, cost: 1, type: "subword" })
      tokens.push({ text: secondPart, cost: 1, type: "subword" })
    } else if (token.match(/[.,!?;:"\s]/)) {
      tokens.push({ text: token, cost: 1, type: "punctuation" })
    } else {
      tokens.push({ text: token, cost: 1, type: "word" })
    }
  })

  return tokens
}

const examples = [
  "Hello world! How does tokenization work?",
  "The quick brown fox jumps over the lazy dog.",
  "Artificial intelligence (AI) is intelligence demonstrated by machines.",
  "GPT-4 is a large multimodal model that can solve difficult problems with greater accuracy.",
]

export default function TokenizationVisualizer() {
  const [inputText, setInputText] = useState(examples[0])
  const [tokens, setTokens] = useState(simulateTokenization(inputText))
  const [animateTokens, setAnimateTokens] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [temperature, setTemperature] = useState(0.7)

  useEffect(() => {
    setTokens(simulateTokenization(inputText))
  }, [inputText])

  const handleTokenize = () => {
    setAnimateTokens(false)
    setTimeout(() => {
      setAnimateTokens(true)
    }, 50)
  }

  const totalTokens = tokens.reduce((sum, token) => sum + token.cost, 0)
  const estimatedCost = (totalTokens * 0.000002).toFixed(6)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          className="max-w-4xl w-full text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Tokenization Visualizer</h2>
          <p className="text-xl text-muted-foreground">See how LLMs break text into tokens for processing</p>
        </motion.div>

        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                className="bg-card border rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="text-input" className="text-sm font-medium">
                      Enter text to tokenize
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text to tokenize"
                        className="flex-1"
                      />
                      <Button onClick={handleTokenize}>Tokenize</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Example texts</label>
                    <div className="flex flex-wrap gap-2">
                      {examples.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setInputText(example)}
                          className="text-xs"
                        >
                          Example {index + 1}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">Temperature: {temperature.toFixed(1)}</label>
                      <div className="text-xs text-muted-foreground">
                        {temperature < 0.3 ? "More deterministic" : temperature > 0.7 ? "More creative" : "Balanced"}
                      </div>
                    </div>
                    <Slider
                      value={[temperature]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-card border rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-4">Tokenized Output</h3>

                <div className="bg-muted/30 rounded-lg p-4 min-h-[150px] mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {tokens.map((token, index) => (
                        <motion.div
                          key={`${token.text}-${index}`}
                          className={cn(
                            "border rounded px-2 py-1 text-sm",
                            token.type === "punctuation"
                              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                              : token.type === "subword"
                                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                                : "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800",
                          )}
                          initial={animateTokens ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: animateTokens ? index * 0.03 : 0 }}
                        >
                          {token.text === " " ? "␣" : token.text}
                          <span className="ml-1 text-xs text-muted-foreground">({token.cost})</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">Total tokens:</span> {totalTokens}
                  </div>
                  <div>
                    <span className="font-medium">Estimated cost:</span> ${estimatedCost}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-medium">About Tokenization</h3>

                <p>
                  LLMs process text as "tokens" rather than individual characters or words. A token can be a word, part
                  of a word, or even a single character.
                </p>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: showExplanation ? "auto" : 0,
                    opacity: showExplanation ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4">
                    <p>
                      This simulation is simplified. Real tokenizers use algorithms like Byte-Pair Encoding (BPE) that
                      identify common patterns in text to create efficient token vocabularies.
                    </p>

                    <div>
                      <h4 className="font-medium mb-2">Why tokens matter:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Models have token limits (context windows)</li>
                        <li>API costs are typically calculated per token</li>
                        <li>Processing time scales with token count</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Token types in this demo:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"></div>
                          <span>Full words</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"></div>
                          <span>Subwords (parts of longer words)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
                          <span>Punctuation and spaces</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Temperature effects:</h4>
                      <p className="text-sm">
                        Higher temperature values make the model's outputs more random and creative, while lower values
                        make it more deterministic and focused.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-sm flex items-center text-blue-500"
                >
                  {showExplanation ? "Show less" : "Learn more about tokenization"}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className={`ml-1 transition-transform ${showExplanation ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

