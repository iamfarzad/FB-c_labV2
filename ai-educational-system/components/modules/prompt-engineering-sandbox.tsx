"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const promptExamples = {
  "zero-shot": {
    prompt: "Explain quantum computing in simple terms.",
    response:
      'Quantum computing uses quantum bits or "qubits" that can exist in multiple states at once, unlike regular computer bits that are either 0 or 1. This allows quantum computers to process certain types of problems much faster than traditional computers. Imagine being able to try many solutions simultaneously instead of one at a time!',
  },
  "few-shot": {
    prompt:
      "Translate English to French:\n\nEnglish: The house is blue.\nFrench: La maison est bleue.\n\nEnglish: The cat is black.\nFrench: Le chat est noir.\n\nEnglish: The book is on the table.\nFrench:",
    response: "Le livre est sur la table.",
  },
  "chain-of-thought": {
    prompt:
      "If John has 5 apples and gives 2 to Mary, then buys 3 more apples and eats 1, how many apples does John have left? Let's think step by step.",
    response:
      "Step 1: John starts with 5 apples.\nStep 2: John gives 2 apples to Mary, so he has 5 - 2 = 3 apples left.\nStep 3: John buys 3 more apples, so he has 3 + 3 = 6 apples.\nStep 4: John eats 1 apple, so he has 6 - 1 = 5 apples left.\nTherefore, John has 5 apples left.",
  },
  "role-based": {
    prompt:
      "You are an expert chef specializing in Italian cuisine. Provide a recipe for an authentic pasta carbonara.",
    response:
      "As an Italian cuisine expert, I'm happy to share an authentic carbonara recipe.\n\nIngredients:\n- 350g spaghetti\n- 150g guanciale (cured pork jowl) or pancetta, diced\n- 4 large egg yolks\n- 1 whole egg\n- 75g Pecorino Romano, freshly grated\n- Freshly ground black pepper\n\nInstructions:\n1. Bring a large pot of salted water to boil and cook pasta until al dente.\n2. While pasta cooks, sauté guanciale in a pan until crispy but not burnt.\n3. In a bowl, whisk egg yolks, whole egg, and grated cheese with plenty of black pepper.\n4. Drain pasta, reserving a cup of pasta water.\n5. Working quickly, add hot pasta to the pan with guanciale, remove from heat.\n6. Add egg mixture, tossing constantly. The residual heat will cook the eggs into a creamy sauce.\n7. Add a splash of pasta water if needed for creaminess.\n8. Serve immediately with extra cheese and black pepper.\n\nNote: Authentic carbonara never contains cream or garlic!",
  },
}

export default function PromptEngineeringSandbox() {
  const [activeTab, setActiveTab] = useState("zero-shot")
  const [prompt, setPrompt] = useState(promptExamples[activeTab as keyof typeof promptExamples].prompt)
  const [response, setResponse] = useState(promptExamples[activeTab as keyof typeof promptExamples].response)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPrompt(promptExamples[value as keyof typeof promptExamples].prompt)
    setResponse(promptExamples[value as keyof typeof promptExamples].response)
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    // Simulate API call delay
    setTimeout(() => {
      setResponse(promptExamples[activeTab as keyof typeof promptExamples].response)
      setIsGenerating(false)
    }, 1500)
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
          <h2 className="text-3xl font-bold mb-4">Prompt Engineering Sandbox</h2>
          <p className="text-xl text-muted-foreground">
            Experiment with different prompting techniques to see how they affect AI responses
          </p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <Tabs defaultValue="zero-shot" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-4 w-full max-w-xl">
                <TabsTrigger value="zero-shot">Zero-Shot</TabsTrigger>
                <TabsTrigger value="few-shot">Few-Shot</TabsTrigger>
                <TabsTrigger value="chain-of-thought">Chain-of-Thought</TabsTrigger>
                <TabsTrigger value="role-based">Role-Based</TabsTrigger>
              </TabsList>
            </div>

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
                    <CardDescription>
                      {activeTab === "zero-shot" && "Direct instructions without examples"}
                      {activeTab === "few-shot" && "Providing examples before the task"}
                      {activeTab === "chain-of-thought" && "Encouraging step-by-step reasoning"}
                      {activeTab === "role-based" && "Assigning a specific role to the AI"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <Button className="w-full mt-4" onClick={handleGenerate} disabled={isGenerating}>
                      {isGenerating ? "Generating..." : "Generate Response"}
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
                    <CardTitle>Response</CardTitle>
                    <CardDescription>See how different prompting techniques affect the output</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`min-h-[300px] p-4 rounded-md bg-muted/30 whitespace-pre-wrap ${isGenerating ? "animate-pulse" : ""}`}
                    >
                      {response}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <TabsContent value="zero-shot" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zero-Shot Prompting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Zero-shot prompting involves giving the AI a direct instruction without examples. The model uses its
                    pre-trained knowledge to generate a response.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">When to use:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Simple, straightforward tasks</li>
                      <li>When the task is common and well-understood</li>
                      <li>When you want to test the model's baseline capabilities</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="few-shot" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Few-Shot Prompting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Few-shot prompting involves providing examples of the task before asking the model to perform it.
                    This helps the model understand the expected format and style of the response.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">When to use:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>When you need specific formatting or structure</li>
                      <li>For translation or conversion tasks</li>
                      <li>When zero-shot performance isn't satisfactory</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chain-of-thought" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chain-of-Thought Prompting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Chain-of-thought prompting encourages the model to break down complex problems into steps. This
                    improves performance on reasoning and math tasks.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">When to use:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Complex reasoning problems</li>
                      <li>Mathematical calculations</li>
                      <li>When you want to understand the model's reasoning process</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="role-based" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Role-Based Prompting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Role-based prompting assigns a specific role or persona to the AI. This can help elicit responses
                    with particular expertise or style.
                  </p>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">When to use:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>When you need domain-specific expertise</li>
                      <li>To get responses in a particular style or tone</li>
                      <li>For creative writing or roleplaying scenarios</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

