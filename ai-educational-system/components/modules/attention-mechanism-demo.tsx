"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const examples = [
  {
    id: "example1",
    sentence: "The cat sat on the mat because it was comfortable.",
    focusWord: "it",
    attentionScores: {
      The: 0.05,
      cat: 0.65,
      sat: 0.1,
      on: 0.05,
      the: 0.05,
      mat: 0.3,
      because: 0.1,
      it: 0.1,
      was: 0.2,
      comfortable: 0.4,
    },
    explanation:
      "The model pays most attention to 'cat' (65%) when processing 'it', correctly identifying that 'it' refers to the cat, not the mat.",
  },
  {
    id: "example2",
    sentence: "The cat sat on the mat because it was soft.",
    focusWord: "it",
    attentionScores: {
      The: 0.05,
      cat: 0.3,
      sat: 0.1,
      on: 0.05,
      the: 0.05,
      mat: 0.7,
      because: 0.1,
      it: 0.1,
      was: 0.2,
      soft: 0.4,
    },
    explanation:
      "The model pays most attention to 'mat' (70%) when processing 'it', correctly identifying that 'it' refers to the mat in this context, not the cat.",
  },
  {
    id: "example3",
    sentence: "The developers released the update after they fixed the bugs.",
    focusWord: "they",
    attentionScores: {
      The: 0.1,
      developers: 0.8,
      released: 0.2,
      the: 0.05,
      update: 0.1,
      after: 0.1,
      they: 0.1,
      fixed: 0.2,
      the: 0.05,
      bugs: 0.3,
    },
    explanation:
      "The model pays most attention to 'developers' (80%) when processing 'they', correctly resolving the pronoun reference.",
  },
]

export default function AttentionMechanismDemo() {
  const [activeExample, setActiveExample] = useState(examples[0])
  const [focusWord, setFocusWord] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [customSentence, setCustomSentence] = useState("")
  const [customFocusWord, setCustomFocusWord] = useState("")
  const [showCustom, setShowCustom] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const words = activeExample.sentence.split(/\s+/)

  useEffect(() => {
    // Reset state when changing examples
    setFocusWord(null)
    setShowExplanation(false)
    setIsAnimating(false)
  }, [activeExample])

  const handleStartAnimation = () => {
    setFocusWord(null)
    setShowExplanation(false)
    setIsAnimating(true)

    // Simulate the animation sequence
    setTimeout(() => {
      setFocusWord(activeExample.focusWord)

      setTimeout(() => {
        setShowExplanation(true)
        setIsAnimating(false)
      }, 2000 / animationSpeed)
    }, 1000 / animationSpeed)
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
          <h2 className="text-3xl font-bold mb-4">Attention Mechanism Demo</h2>
          <p className="text-xl text-muted-foreground">
            Visualize how LLMs focus on different parts of text to understand context
          </p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                className="bg-card border rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium">Attention Visualization</h3>
                  <div className="flex gap-2">
                    {examples.map((example, index) => (
                      <Button
                        key={example.id}
                        variant={activeExample.id === example.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveExample(example)}
                        disabled={isAnimating}
                      >
                        Example {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>

                <div
                  ref={containerRef}
                  className="min-h-[300px] flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg mb-6"
                >
                  <div className="flex flex-wrap justify-center gap-2 mb-16">
                    {words.map((word, index) => {
                      const isHighlightable = word === activeExample.focusWord
                      const isSelected = word === focusWord

                      // Get attention scores if this word is selected
                      const attentionScores = focusWord ? activeExample.attentionScores : null

                      return (
                        <div key={index} className="relative">
                          <motion.div
                            className={cn(
                              "px-3 py-2 rounded-lg text-lg relative z-10 transition-colors",
                              isHighlightable ? "cursor-pointer" : "cursor-default",
                              isSelected
                                ? "bg-blue-500 text-white"
                                : isHighlightable
                                  ? "bg-blue-100 dark:bg-blue-900/30"
                                  : "",
                            )}
                            onClick={() => {
                              if (isHighlightable && !isAnimating) {
                                setFocusWord(isSelected ? null : word)
                                setShowExplanation(false)
                              }
                            }}
                            whileHover={isHighlightable && !isAnimating ? { scale: 1.05 } : {}}
                            whileTap={isHighlightable && !isAnimating ? { scale: 0.95 } : {}}
                          >
                            {word}
                          </motion.div>

                          {/* Attention score indicator */}
                          {attentionScores && attentionScores[word] > 0.1 && (
                            <motion.div
                              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded",
                                  attentionScores[word] > 0.5
                                    ? "bg-blue-500 text-white"
                                    : "bg-blue-100 dark:bg-blue-900/30",
                                )}
                              >
                                {(attentionScores[word] * 100).toFixed(0)}%
                              </span>
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {focusWord && (
                    <div className="w-full">
                      <motion.div
                        className="h-[2px] bg-blue-400/50 w-full mb-8"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5 }}
                      />

                      {showExplanation && (
                        <motion.div
                          className="text-center max-w-lg mx-auto"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-lg">{activeExample.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Connection lines */}
                  {focusWord && (
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                      {words.map((word, index) => {
                        if (!activeExample.attentionScores[word] || activeExample.attentionScores[word] <= 0.1)
                          return null

                        // This would need proper DOM positioning in a real implementation
                        // Here we're approximating for demonstration
                        const focusIndex = words.indexOf(focusWord)
                        const wordX = (index + 0.5) * (100 / words.length)
                        const focusX = (focusIndex + 0.5) * (100 / words.length)
                        const strength = activeExample.attentionScores[word]

                        return (
                          <motion.line
                            key={`line-${index}`}
                            x1={`${focusX}%`}
                            y1="40%"
                            x2={`${wordX}%`}
                            y2="15%"
                            stroke={`rgba(59, 130, 246, ${strength})`}
                            strokeWidth={Math.max(1, strength * 5)}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        )
                      })}
                    </svg>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Animation Speed</span>
                      <span>{animationSpeed}x</span>
                    </div>
                    <Slider
                      value={[animationSpeed]}
                      min={0.5}
                      max={2}
                      step={0.5}
                      onValueChange={(value) => setAnimationSpeed(value[0])}
                      disabled={isAnimating}
                    />
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={handleStartAnimation} disabled={isAnimating} className="px-8">
                      {isAnimating ? "Animating..." : "Run Animation"}
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
                <h3 className="text-xl font-medium mb-4">About Attention</h3>

                <div className="space-y-4">
                  <p>
                    Attention is a key mechanism in transformer models that allows them to focus on different parts of
                    the input when generating each word of output.
                  </p>

                  <div>
                    <h4 className="font-medium mb-2">How it works:</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>
                        For each word, the model calculates "attention scores" for all other words in the context.
                      </li>
                      <li>
                        Higher scores mean the model pays more attention to that word when processing the current word.
                      </li>
                      <li>
                        This allows the model to resolve references (like pronouns) and understand relationships between
                        words.
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Why it matters:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Enables long-range dependencies in text</li>
                      <li>Helps resolve ambiguity and references</li>
                      <li>Allows the model to focus on relevant context</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Try it yourself:</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Click on the highlighted word in the examples to see attention in action, or run the animation to
                      see the full process.
                    </p>

                    <Button variant="outline" size="sm" onClick={() => setShowCustom(!showCustom)} className="w-full">
                      {showCustom ? "Hide Custom Example" : "Create Custom Example"}
                    </Button>

                    <AnimatePresence>
                      {showCustom && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Coming soon: Create your own sentences and see how attention works!
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

