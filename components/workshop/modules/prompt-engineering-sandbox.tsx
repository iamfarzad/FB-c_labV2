"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const promptExamples = {
  'zero-shot': { prompt: 'Explain quantum computing in simple terms.', response: 'Quantum computing uses qubits that can be in multiple states...' },
  'few-shot': { prompt: 'Translate English to French:\n\nEnglish: The house is blue.\nFrench: La maison est bleue.\n\nEnglish: The cat is black.\nFrench: Le chat est noir.\n\nEnglish: The book is on the table.\nFrench:', response: 'Le livre est sur la table.' },
  'chain-of-thought': { prompt: "If John has 5 apples... Let's think step by step.", response: 'Step 1... Step 2... Therefore, 5 apples left.' },
  'role-based': { prompt: 'You are an expert chef. Provide a carbonara recipe.', response: 'Ingredients... Instructions... No cream.' },
}

export default function PromptEngineeringSandbox() {
  const [activeTab, setActiveTab] = useState('zero-shot')
  const [prompt, setPrompt] = useState(promptExamples['zero-shot'].prompt)
  const [response, setResponse] = useState(promptExamples['zero-shot'].response)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // @ts-expect-error narrow known keys
    setPrompt(promptExamples[value].prompt)
    // @ts-expect-error narrow known keys
    setResponse(promptExamples[value].response)
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => { setIsGenerating(false) }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div className="max-w-4xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">Prompt Engineering Sandbox</h2>
          <p className="text-xl text-muted-foreground">Experiment with prompting techniques and compare outputs</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="zero-shot" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-6"><TabsList className="grid grid-cols-4 w-full max-w-xl"><TabsTrigger value="zero-shot">Zero‑Shot</TabsTrigger><TabsTrigger value="few-shot">Few‑Shot</TabsTrigger><TabsTrigger value="chain-of-thought">Chain‑of‑Thought</TabsTrigger><TabsTrigger value="role-based">Role‑Based</TabsTrigger></TabsList></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card><CardHeader><CardTitle>Prompt</CardTitle><CardDescription>Write or edit the input</CardDescription></CardHeader><CardContent><Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[300px] font-mono text-sm" /><Button className="w-full mt-4" onClick={handleGenerate} disabled={isGenerating}>{isGenerating ? 'Generating…' : 'Generate Response'}</Button></CardContent></Card>
              </motion.div>
              <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card><CardHeader><CardTitle>Response</CardTitle><CardDescription>Sample output</CardDescription></CardHeader><CardContent><div className={`min-h-[300px] p-4 rounded-md bg-muted/30 whitespace-pre-wrap ${isGenerating ? 'animate-pulse' : ''}`}>{response}</div></CardContent></Card>
              </motion.div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


