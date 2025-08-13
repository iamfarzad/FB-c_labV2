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
        <motion.div
          className="max-w-4xl w-full text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Fine-Tuning vs. Prompting vs. RAG</h2>
          <p className="text-xl text-muted-foreground">Compare different approaches to customizing LLM behavior</p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <Tabs defaultValue="prompting" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-xl">
                <TabsTrigger value="prompting">Prompting</TabsTrigger>
                <TabsTrigger value="rag">RAG</TabsTrigger>
                <TabsTrigger value="fine-tuning">Fine-Tuning</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="prompting">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Prompt Engineering</CardTitle>
                          <CardDescription>Crafting effective instructions</CardDescription>
                        </div>
                        <Badge>Easiest</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">System Prompt</label>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="You are a helpful assistant that specializes in summarizing scientific papers."
                          defaultValue="You are a helpful assistant that specializes in summarizing scientific papers."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">User Query</label>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Summarize this paper in 3 bullet points..."
                          defaultValue="Summarize this paper in 3 bullet points: [paper content]"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Generate Response</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Prompting Approach</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium">Advantages</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>No additional training required</li>
                          <li>Quick to implement and iterate</li>
                          <li>Zero additional cost beyond API usage</li>
                          <li>Can be adjusted on-the-fly</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Limitations</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Limited by context window size</li>
                          <li>May not consistently follow instructions</li>
                          <li>No persistent learning</li>
                          <li>Prompt engineering can be an art</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Best For</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Quick prototyping</li>
                          <li>General-purpose applications</li>
                          <li>When flexibility is needed</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="rag">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Retrieval-Augmented Generation</CardTitle>
                          <CardDescription>Enhancing LLMs with external knowledge</CardDescription>
                        </div>
                        <Badge variant="secondary">Moderate</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Knowledge Base</label>
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">company_handbook.pdf</span>
                            <Badge variant="outline">Indexed</Badge>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">product_specs.docx</span>
                            <Badge variant="outline">Indexed</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">customer_faqs.md</span>
                            <Badge variant="outline">Indexed</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">User Query</label>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="What is our company's vacation policy?"
                          defaultValue="What is our company's vacation policy?"
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Generate Response with RAG</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>RAG Approach</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium">Advantages</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Provides up-to-date information</li>
                          <li>Reduces hallucinations</li>
                          <li>Can handle domain-specific knowledge</li>
                          <li>No model retraining required</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Limitations</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Requires vector database setup</li>
                          <li>Quality depends on retrieval accuracy</li>
                          <li>May struggle with complex reasoning over documents</li>
                          <li>Additional latency from retrieval step</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Best For</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Question-answering over specific documents</li>
                          <li>Customer support applications</li>
                          <li>When information changes frequently</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="fine-tuning">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Fine-Tuning</CardTitle>
                          <CardDescription>Training the model on custom data</CardDescription>
                        </div>
                        <Badge variant="destructive">Advanced</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Training Data</label>
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                          <div className="mb-2">
                            <div className="font-medium">Example 1:</div>
                            <div className="pl-2 border-l-2 border-muted-foreground/30 mt-1">
                              <div>
                                <span className="text-blue-500">Input:</span> Summarize the quarterly results
                              </div>
                              <div>
                                <span className="text-green-500">Output:</span> Q1 revenue increased by 15%...
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Example 2:</div>
                            <div className="pl-2 border-l-2 border-muted-foreground/30 mt-1">
                              <div>
                                <span className="text-blue-500">Input:</span> Analyze market trends
                              </div>
                              <div>
                                <span className="text-green-500">Output:</span> The market shows three key trends...
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">+ 998 more examples in training set</div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fine-Tuning Parameters</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs">Epochs</label>
                            <Input type="number" defaultValue="3" />
                          </div>
                          <div>
                            <label className="text-xs">Learning Rate</label>
                            <Input type="number" defaultValue="0.0002" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Start Fine-Tuning</Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Fine-Tuning Approach</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium">Advantages</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Persistent learning of patterns</li>
                          <li>More consistent outputs</li>
                          <li>Can learn company-specific knowledge</li>
                          <li>Shorter prompts needed at inference time</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Limitations</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Requires significant training data</li>
                          <li>Expensive and time-consuming</li>
                          <li>Risk of overfitting</li>
                          <li>Static knowledge (needs retraining for updates)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium">Best For</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                          <li>Specialized tasks with consistent patterns</li>
                          <li>When output format consistency is critical</li>
                          <li>Enterprise applications with stable requirements</li>
                        </ul>
                      </div>
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
                <CardTitle>Comparison: Cost vs. Performance vs. Complexity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[300px] bg-muted/30 rounded-md p-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-lg">
                      <div className="relative pt-10">
                        {/* X-axis */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted-foreground/50"></div>
                        <div className="absolute bottom-0 left-0 text-xs -mb-6">Low Complexity</div>
                        <div className="absolute bottom-0 right-0 text-xs -mb-6">High Complexity</div>

                        {/* Y-axis */}
                        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-muted-foreground/50"></div>
                        <div className="absolute top-0 left-0 text-xs -ml-6 -mt-2">High Performance</div>
                        <div className="absolute bottom-0 left-0 text-xs -ml-6 -mb-2">Low Performance</div>

                        {/* Bubbles */}
                        <div
                          className="absolute left-[20%] bottom-[30%] w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-sm font-medium"
                          style={{ transform: "translate(-50%, 50%)" }}
                        >
                          Prompting
                        </div>

                        <div
                          className="absolute left-[50%] bottom-[50%] w-24 h-24 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-sm font-medium"
                          style={{ transform: "translate(-50%, 50%)" }}
                        >
                          RAG
                        </div>

                        <div
                          className="absolute left-[80%] bottom-[70%] w-28 h-28 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-sm font-medium"
                          style={{ transform: "translate(-50%, 50%)" }}
                        >
                          Fine-Tuning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <h4 className="font-medium text-blue-500">Prompting</h4>
                    <p className="text-sm text-muted-foreground">Low cost, moderate performance, simple to implement</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-500">RAG</h4>
                    <p className="text-sm text-muted-foreground">Moderate cost, good performance, medium complexity</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-500">Fine-Tuning</h4>
                    <p className="text-sm text-muted-foreground">
                      High cost, excellent performance, complex implementation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

