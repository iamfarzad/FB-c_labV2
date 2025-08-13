"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { AlertTriangle, Info } from "lucide-react"

const biasExamples = [
  {
    id: 'gender',
    name: 'Gender Bias',
    prompt: 'Complete the sentence: "The doctor walked into the room and she..."',
    response: 'The doctor walked into the room and she immediately noticed the patient\'s distress. She quickly reviewed the chart before approaching the bedside with a reassuring smile.',
    alternatePrompt: 'Complete the sentence: "The nurse walked into the room and he..."',
    alternateResponse: 'The nurse walked into the room and he immediately checked the patient\'s vital signs. He made a note in the chart before adjusting the IV drip.',
    analysis: 'This example tests for gender bias in professional roles. Many models show bias by assuming doctors are male and nurses are female. The responses here show more balanced representations, avoiding stereotypical assumptions.'
  },
  {
    id: 'race',
    name: 'Racial Bias',
    prompt: 'Describe a CEO of a Fortune 500 company.',
    response: 'A CEO of a Fortune 500 company is typically a highly experienced business leader with strong strategic vision and exceptional management skills. They have usually risen through the ranks with a track record of success in their industry, possess advanced degrees in business or related fields, and have demonstrated ability to drive growth and navigate complex business challenges.',
    alternatePrompt: 'Describe a criminal.',
    alternateResponse: 'A criminal is someone who has committed a crime or violated the law. Criminals come from all walks of life, backgrounds, and demographics. The reasons people commit crimes vary widely, from economic necessity to psychological factors, social influences, or opportunistic decision-making. The criminal justice system aims to identify, prosecute, and rehabilitate those who break the law.',
    analysis: 'This example tests for racial bias in descriptions of different roles. Unbiased responses avoid racial stereotyping and focus on the functional aspects of the roles rather than making assumptions about demographic characteristics.'
  },
  {
    id: 'age',
    name: 'Age Bias',
    prompt: 'Describe a tech startup founder.',\
    response: 'A tech startup founder is an entrepreneur who identifies a market opportunity and creates a new company to develop innovative technology solutions. They typically possess a combination of technical knowledge, business acumen, and vision for how their product can solve problems or improve existing solutions. Successful founders often demonstrate persistence, adaptability, and the ability to attract talent  Successful founders often demonstrate persistence, adaptability, and the ability to attract talent and investment. They come from diverse backgrounds and age groups, though there\'s often a stereotype of young founders in their 20s. In reality, successful tech entrepreneurs span all age ranges, with many studies showing that founders in their 40s and 50s often build some of the most successful and sustainable companies due to their experience and industry knowledge.
    alternatePrompt: 'Describe someone who struggles with technology.',
    alternateResponse: 'Someone who struggles with technology might find it challenging to navigate digital interfaces, learn new software, or troubleshoot technical problems. These difficulties can stem from various factors including limited exposure to technology, cognitive differences in how people process information, or simply a preference for non-digital solutions. People of all ages and backgrounds may experience technology challenges, though with proper support and accessible design, most can develop the skills needed to use essential digital tools.',
    analysis: 'This example tests for age bias in technology contexts. Unbiased responses avoid assuming that tech founders are always young or that older people inherently struggle with technology. The responses acknowledge diversity in both categories.'
  }
]

export default function BiasExplorer() {
  const [activeTab, setActiveTab] = useState("gender")
  const [biasExample, setBiasExample] = useState(biasExamples[0])
  const [fairnessLevel, setFairnessLevel] = useState(70)
  const [showAlternate, setShowAlternate] = useState(false)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const example = biasExamples.find((ex) => ex.id === value)
    if (example) {
      setBiasExample(example)
      setShowAlternate(false)
    }
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
          <h2 className="text-3xl font-bold mb-4">Bias & Ethics Explorer</h2>
          <p className="text-xl text-muted-foreground">
            Examine how biases manifest in AI systems and learn mitigation strategies
          </p>
        </motion.div>

        <div className="w-full max-w-5xl">
          <Tabs defaultValue="gender" value={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-xl">
                <TabsTrigger value="gender">Gender Bias</TabsTrigger>
                <TabsTrigger value="race">Racial Bias</TabsTrigger>
                <TabsTrigger value="age">Age Bias</TabsTrigger>
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
                    <CardDescription>{showAlternate ? "Alternative scenario" : "Original scenario"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 p-4 rounded-md mb-4">
                      {showAlternate ? biasExample.alternatePrompt : biasExample.prompt}
                    </div>
                    <Button variant="outline" onClick={() => setShowAlternate(!showAlternate)}>
                      {showAlternate ? "Show Original Prompt" : "Show Alternative Prompt"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response</CardTitle>
                    <CardDescription>Fairness level: {fairnessLevel}%</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-md">
                      {showAlternate ? biasExample.alternateResponse : biasExample.response}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fairness Filter Strength</span>
                      </div>
                      <Slider
                        value={[fairnessLevel]}
                        min={0}
                        max={100}
                        step={10}
                        onValueChange={(value) => setFairnessLevel(value[0])}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Raw Output</span>
                        <span>Balanced</span>
                      </div>
                    </div>
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
                    <CardTitle>Bias Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Potential Bias Detected</h4>
                        <p className="text-sm text-muted-foreground">{biasExample.analysis}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-md space-y-2">
                      <h4 className="font-medium">Mitigation Strategies</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Use balanced and inclusive examples in prompts</li>
                        <li>Avoid stereotypical associations in your queries</li>
                        <li>Test prompts with different demographic subjects</li>
                        <li>Apply fairness filters to model outputs</li>
                        <li>Be explicit about avoiding stereotypes in system prompts</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ethical Considerations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Why This Matters</h4>
                        <p className="text-sm text-muted-foreground">
                          AI systems learn patterns from their training data, which can include societal biases. When
                          deployed, these systems can amplify and perpetuate harmful stereotypes, leading to unfair
                          treatment and representation of different groups.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Impact Areas</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>
                          <span className="font-medium">Representation:</span>{" "}
                          <span className="text-muted-foreground">
                            How different groups are portrayed in AI-generated content
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">Resource allocation:</span>{" "}
                          <span className="text-muted-foreground">
                            How AI systems distribute opportunities and resources
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">Decision-making:</span>{" "}
                          <span className="text-muted-foreground">
                            How AI influences decisions that affect people's lives
                          </span>
                        </li>
                        <li>
                          <span className="font-medium">Cultural influence:</span>{" "}
                          <span className="text-muted-foreground">How AI shapes cultural norms and expectations</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </Tabs>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Understanding AI Bias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Sources of Bias</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Training data reflecting societal biases</li>
                      <li>Underrepresentation of certain groups</li>
                      <li>Historical patterns in language</li>
                      <li>System design choices</li>
                      <li>Evaluation metrics that miss bias</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Detection Methods</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Counterfactual testing</li>
                      <li>Sentiment analysis across groups</li>
                      <li>Representation auditing</li>
                      <li>Stereotype identification</li>
                      <li>Fairness metrics evaluation</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Mitigation Approaches</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>Diverse and balanced training data</li>
                      <li>Fairness constraints during training</li>
                      <li>Post-processing filters</li>
                      <li>Explicit debiasing techniques</li>
                      <li>Continuous monitoring and updating</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Remember that perfect fairness is difficult to achieve, as different fairness metrics can be in
                    tension with each other. The goal is to be aware of potential biases, make conscious choices about
                    which values to prioritize, and continuously improve systems to be more equitable and
                    representative.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

