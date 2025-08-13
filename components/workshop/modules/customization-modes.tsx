"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function CustomizationModes() {
  const [activeTab, setActiveTab] = useState("prompting")
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div className="max-w-4xl w-full text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold mb-4">Fine-Tuning vs. Prompting vs. RAG</h2>
          <p className="text-xl text-muted-foreground">Compare different approaches to customizing LLM behavior</p>
        </motion.div>
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="prompting" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6"><TabsList className="grid grid-cols-3 w-full max-w-xl"><TabsTrigger value="prompting">Prompting</TabsTrigger><TabsTrigger value="rag">RAG</TabsTrigger><TabsTrigger value="fine-tuning">Fine-Tuning</TabsTrigger></TabsList></div>
            <TabsContent value="prompting">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start"><div><CardTitle>Prompt Engineering</CardTitle><CardDescription>Crafting effective instructions</CardDescription></div><Badge>Easiest</Badge></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><label className="text-sm font-medium">System Prompt</label><Textarea className="min-h-[100px]" defaultValue="You are a helpful assistant that specializes in summarizing scientific papers." /></div>
                      <div className="space-y-2"><label className="text-sm font-medium">User Query</label><Textarea className="min-h-[100px]" defaultValue="Summarize this paper in 3 bullet points: [paper content]" /></div>
                    </CardContent>
                    <CardFooter><Button className="w-full">Generate Response</Button></CardFooter>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <Card><CardHeader><CardTitle>Prompting Approach</CardTitle></CardHeader><CardContent className="space-y-4"><div><h4 className="font-medium">Advantages</h4><ul className="list-disc pl-5 space-y-1 text-sm mt-2"><li>No additional training required</li><li>Quick to implement and iterate</li><li>Zero additional cost beyond API usage</li><li>Can be adjusted on-the-fly</li></ul></div><div><h4 className="font-medium">Limitations</h4><ul className="list-disc pl-5 space-y-1 text-sm mt-2"><li>Limited by context window size</li><li>May not consistently follow instructions</li><li>No persistent learning</li><li>Prompt engineering can be an art</li></ul></div></CardContent></Card>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="rag">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start"><div><CardTitle>Retrieval-Augmented Generation</CardTitle><CardDescription>Enhancing LLMs with external knowledge</CardDescription></div><Badge variant="secondary">Moderate</Badge></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><label className="text-sm font-medium">Knowledge Base</label><div className="bg-muted/30 p-3 rounded-md text-sm"><div className="flex justify-between items-center mb-2"><span className="font-medium">company_handbook.pdf</span><Badge variant="outline">Indexed</Badge></div><div className="flex justify-between items-center mb-2"><span className="font-medium">product_specs.docx</span><Badge variant="outline">Indexed</Badge></div><div className="flex justify-between items-center"><span className="font-medium">customer_faqs.md</span><Badge variant="outline">Indexed</Badge></div></div></div>
                      <div className="space-y-2"><label className="text-sm font-medium">User Query</label><Textarea className="min-h-[100px]" defaultValue="What is our company's vacation policy?" /></div>
                    </CardContent>
                    <CardFooter><Button className="w-full">Generate Response with RAG</Button></CardFooter>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <Card><CardHeader><CardTitle>RAG Approach</CardTitle></CardHeader><CardContent className="space-y-4"><div><h4 className="font-medium">Advantages</h4><ul className="list-disc pl-5 space-y-1 text-sm mt-2"><li>Provides up-to-date information</li><li>Reduces hallucinations</li><li>Handles domain knowledge</li><li>No model retraining required</li></ul></div><div><h4 className="font-medium">Limitations</h4><ul className="list-disc pl-5 space-y-1 text-sm mt-2"><li>Requires retrieval infra</li><li>Quality depends on retrieval</li><li>Added latency</li></ul></div></CardContent></Card>
                </motion.div>
              </div>
            </TabsContent>
            <TabsContent value="fine-tuning">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Card>
                    <CardHeader><div className="flex justify-between items-start"><div><CardTitle>Fine-Tuning</CardTitle><CardDescription>Training the model on custom data</CardDescription></div><Badge variant="destructive">Advanced</Badge></div></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2"><label className="text-sm font-medium">Training Data</label><div className="bg-muted/30 p-3 rounded-md text-sm"><div className="mb-2"><div className="font-medium">Example 1:</div><div className="pl-2 border-l-2 border-muted-foreground/30 mt-1"><div><span className="text-blue-500">Input:</span> Summarize the quarterly results</div><div><span className="text-green-500">Output:</span> Q1 revenue increased by 15%...</div></div></div><div><div className="font-medium">Example 2:</div><div className="pl-2 border-l-2 border-muted-foreground/30 mt-1"><div><span className="text-blue-500">Input:</span> Analyze market trends</div><div><span className="text-green-500">Output:</span> The market shows three key trends...</div></div></div></div></div>
                      <div className="space-y-2"><label className="text-sm font-medium">Fine-Tuning Parameters</label><div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Epochs</label><Input type="number" defaultValue="3" /></div><div><label className="text-xs">Learning Rate</label><Input type="number" defaultValue="0.0002" /></div></div></div>
                    </CardContent>
                    <CardFooter><Button className="w-full">Start Fine-Tuning</Button></CardFooter>
                  </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                  <Card><CardHeader><CardTitle>Fine-Tuning Approach</CardTitle></CardHeader><CardContent className="space-y-4"><div><h4 className="font-medium">Advantages</h4><ul className="list-disc pl-5 space-y-1 text-sm mt-2"><li>Persistent learning of patterns</li><li>More consistent outputs</li><li>Can learn company-specific knowledge</li></ul></div><div><h4 className="font-medium">Limitations</h4><ul className="list-disc pl-5 space-y-1 text-sm mt-2"><li>Requires significant data</li><li>Expensive and time-consuming</li><li>Risk of overfitting</li></ul></div></CardContent></Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}


