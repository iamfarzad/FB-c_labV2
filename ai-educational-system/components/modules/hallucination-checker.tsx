"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const examples = [
  {
    id: "factual",
    prompt: "What is the capital of France?",
    response:
      "The capital of France is Paris. It is located in the north-central part of the country on the Seine River.",
    analysis: {
      isHallucination: false,
      confidence: 0.98,
      explanation:
        "This response is factually correct. Paris is indeed the capital of France and is located on the Seine River in north-central France.",
      sources: ["Geographic database", "Encyclopedia references"],
    },
  },
  {
    id: "partial",
    prompt: "Who invented the telephone?",
    response:
      "The telephone was invented by Alexander Graham Bell in 1876. He was the first person to patent the technology, though Antonio Meucci had developed a voice communication device several years earlier.",
    analysis: {
      isHallucination: false,
      confidence: 0.85,
      explanation:
        "This response acknowledges both Bell's patent and Meucci's earlier work, showing nuance in a historically contested invention.",
      sources: ["Patent records", "Historical accounts"],
    },
  },
  {
    id: "hallucination",
    prompt: "Tell me about the history of Mount Everest's underwater exploration.",
    response:
      "Mount Everest's underwater exploration began in the late 1960s when marine biologist Jacques Cousteau led the first expedition to study the unique aquatic ecosystem at the mountain's base. The \"Everest Underwater Project\" discovered several endemic species adapted to the high-altitude underwater environment. Subsequent expeditions in the 1980s mapped extensive cave systems beneath the mountain.",
    analysis: {
      isHallucination: true,
      confidence: 0.99,
      explanation:
        'This response is a complete fabrication. Mount Everest is not underwater and has no aquatic ecosystem. Jacques Cousteau never led an "Everest Underwater Project" as described.',
      sources: ["Geographic facts", "Biographical information"],
    },
  },
]

export default function HallucinationChecker() {
  const [activeTab, setActiveTab] = useState("factual")
  const [prompt, setPrompt] = useState(examples[0].prompt)
  const [response, setResponse] = useState(examples[0].response)
  const [analysis, setAnalysis] = useState(examples[0].analysis)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [customResponse, setCustomResponse] = useState("")
  const [showCustomAnalysis, setShowCustomAnalysis] = useState(false)

  const handleTabChange = (value: string) => {
    const example = examples.find((ex) => ex.id === value)
    if (example) {
      setActiveTab(value)
      setPrompt(example.prompt)
      setResponse(example.response)
      setAnalysis(example.analysis)
    }
  }

  const handleAnalyzeCustom = () => {
    if (!customPrompt || !customResponse) return

    setIsAnalyzing(true)

    // Simulate analysis delay
    setTimeout(() => {
      // This would be a real analysis in a production implementation
      setShowCustomAnalysis(true)
      setIsAnalyzing(false)
    }, 2000)
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
          <h2 className="text-3xl font-bold mb-4">Hallucination Detector</h2>
          <p className="text-xl text-muted-foreground">Learn to identify and mitigate AI hallucinations</p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <Tabs defaultValue="factual" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-4 w-full max-w-xl">
                <TabsTrigger value="factual">Factual</TabsTrigger>
                <TabsTrigger value="partial">Partial Truth</TabsTrigger>
                <TabsTrigger value="hallucination">Hallucination</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="factual">
              <ExampleTab prompt={prompt} response={response} analysis={analysis} />
            </TabsContent>

            <TabsContent value="partial">
              <ExampleTab prompt={prompt} response={response} analysis={analysis} />
            </TabsContent>

            <TabsContent value="hallucination">
              <ExampleTab prompt={prompt} response={response} analysis={analysis} />
            </TabsContent>

            <TabsContent value="custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Input</CardTitle>
                      <CardDescription>Enter a prompt and response to analyze</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prompt</label>
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder="Enter a prompt..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Response</label>
                        <Textarea
                          value={customResponse}
                          onChange={(e) => setCustomResponse(e.target.value)}
                          placeholder="Enter an AI response to analyze..."
                          className="min-h-[150px]"
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleAnalyzeCustom}
                        disabled={isAnalyzing || !customPrompt || !customResponse}
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Response"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis</CardTitle>
                      <CardDescription>Hallucination detection results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {showCustomAnalysis ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">Potential hallucination detected</span>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            The response contains statements that cannot be verified or may be fabricated. Consider
                            fact-checking any important claims before relying on this information.
                          </p>

                          <div className="bg-muted/30 p-4 rounded-md space-y-2">
                            <p className="text-sm font-medium">Mitigation strategies:</p>
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              <li>Ask for sources or references</li>
                              <li>Break complex questions into simpler ones</li>
                              <li>Use search engines to verify key claims</li>
                              <li>Consider using RAG (Retrieval-Augmented Generation)</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          Enter a prompt and response, then click "Analyze Response"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Understanding AI Hallucinations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">What are hallucinations?</h4>
                  <p className="text-sm text-muted-foreground">
                    AI hallucinations occur when language models generate information that is factually incorrect,
                    fabricated, or cannot be supported by reliable evidence. These can range from subtle inaccuracies to
                    completely fictional accounts presented as fact.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Why do hallucinations happen?</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm mt-2 text-muted-foreground">
                    <li>Models are trained to predict plausible text, not necessarily factual text</li>
                    <li>Training data may contain inaccuracies or outdated information</li>
                    <li>Models have no true understanding of the world or ability to verify facts</li>
                    <li>The statistical nature of language prediction can produce confident-sounding falsehoods</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium">How to detect hallucinations</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm mt-2 text-muted-foreground">
                    <li>Look for overly specific details that seem unnecessary</li>
                    <li>Be skeptical of surprising or extraordinary claims</li>
                    <li>Check for internal consistency within the response</li>
                    <li>Verify important information with reliable external sources</li>
                    <li>Ask the model to provide references or citations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ExampleTab({
  prompt,
  response,
  analysis,
}: {
  prompt: string
  response: string
  analysis: {
    isHallucination: boolean
    confidence: number
    explanation: string
    sources: string[]
  }
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-md">{prompt}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-md">{response}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {analysis.isHallucination ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Hallucination Detected</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Factually Accurate</span>
                </>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                Confidence: {(analysis.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <h4 className="font-medium mb-2">Explanation</h4>
              <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Verification Sources</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {analysis.sources.map((source, index) => (
                  <li key={index} className="text-muted-foreground">
                    {source}
                  </li>
                ))}
              </ul>
            </div>

            {analysis.isHallucination && (
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md border border-red-200 dark:border-red-900">
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Warning Signs</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-red-600 dark:text-red-300">
                  <li>Overly specific details that can't be verified</li>
                  <li>Implausible scenarios or connections</li>
                  <li>Fabricated events, people, or research</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mitigation Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.isHallucination ? (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Ask for specific sources or citations</li>
                  <li>Break down complex questions into simpler ones</li>
                  <li>Use search engines to verify key claims</li>
                  <li>Implement RAG (Retrieval-Augmented Generation)</li>
                  <li>Specify that the model should say "I don't know" when uncertain</li>
                </ul>
              ) : (
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Continue to verify important information</li>
                  <li>Be aware that even mostly accurate responses may contain minor errors</li>
                  <li>Consider the model's knowledge cutoff date for time-sensitive information</li>
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

