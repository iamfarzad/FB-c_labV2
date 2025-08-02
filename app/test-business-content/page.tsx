"use client"

import React, { useState } from 'react'
import { BusinessContentRenderer } from '@/components/chat/BusinessContentRenderer'
import { 
  businessContentTemplates, 
  findTemplateByKeywords, 
  generateBusinessContent 
} from '@/lib/business-content-templates'
import type { BusinessInteractionData, UserBusinessContext } from '@/types/business-content'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TestBusinessContentPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [interactionLog, setInteractionLog] = useState<BusinessInteractionData[]>([])
  const [userContext, setUserContext] = useState<UserBusinessContext>({
    industry: 'Technology',
    companySize: 'SMB',
    conversationStage: 'discovery',
    currentGoals: ['Improve efficiency', 'Reduce costs', 'Scale operations'],
    businessChallenges: ['Manual processes', 'Data silos', 'Resource constraints']
  })

  const handleBusinessInteraction = (data: BusinessInteractionData) => {
    console.log('Business Interaction:', data)
    setInteractionLog(prev => [...prev, data])
    
    // Mock responses based on interaction type
    if (data.type === 'roi_input') {
      alert(`ROI Calculation received: ${data.value}`)
    } else if (data.type === 'lead_submit') {
      alert(`Lead form submitted: ${data.elementText}`)
    } else if (data.type === 'consultation_step') {
      alert(`Consultation step: ${data.elementText}`)
    }
  }

  const testKeywords = [
    'calculate ROI for automation',
    'schedule consultation meeting',
    'create implementation plan',
    'show business analysis dashboard'
  ]

  const renderTemplate = (templateId: string) => {
    const template = businessContentTemplates.find(t => t.id === templateId)
    if (!template) return null

    const content = generateBusinessContent(template, userContext)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <Badge variant="outline">{template.id}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="border rounded-lg p-4">
          <BusinessContentRenderer
            htmlContent={content}
            onInteract={handleBusinessInteraction}
            userContext={userContext}
            isLoading={false}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">F.B/c Business Content System Test</h1>
        <p className="text-muted-foreground">
          Test the business content templates and interaction system with mock data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Templates</CardTitle>
              <CardDescription>Click to test each template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {businessContentTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  {template.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keyword Testing</CardTitle>
              <CardDescription>Test template matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {testKeywords.map((keyword, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start text-xs"
                  onClick={() => {
                    const template = findTemplateByKeywords(keyword)
                    if (template) {
                      setSelectedTemplate(template.id)
                    } else {
                      alert('No template found for: ' + keyword)
                    }
                  }}
                >
                  "{keyword}"
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Context</CardTitle>
              <CardDescription>Mock user data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Industry:</strong> {userContext.industry}</div>
              <div><strong>Company Size:</strong> {userContext.companySize}</div>
              <div><strong>Stage:</strong> {userContext.conversationStage}</div>
              <div>
                <strong>Goals:</strong>
                <ul className="list-disc list-inside mt-1">
                  {userContext.currentGoals?.map((goal, i) => (
                    <li key={i} className="text-xs">{goal}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Rendering */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            renderTemplate(selectedTemplate)
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Select a template to test</p>
                  <Button 
                    onClick={() => setSelectedTemplate('roi_calculator')}
                    variant="outline"
                  >
                    Start with ROI Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interaction Log */}
          {interactionLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interaction Log</CardTitle>
                <CardDescription>
                  Recent business interactions ({interactionLog.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {interactionLog.slice(-5).reverse().map((interaction, index) => (
                    <div key={index} className="border rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{interaction.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {interaction.elementType}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div><strong>ID:</strong> {interaction.id}</div>
                        <div><strong>Text:</strong> {interaction.elementText}</div>
                        {interaction.value && (
                          <div><strong>Value:</strong> {interaction.value}</div>
                        )}
                        {interaction.businessContext?.currentTool && (
                          <div><strong>Tool:</strong> {interaction.businessContext.currentTool}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {interactionLog.length > 5 && (
                  <div className="mt-3 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => console.log('All interactions:', interactionLog)}
                    >
                      View All in Console
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Debug Information */}
      <Separator className="my-8" />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Template Statistics</h4>
              <ul className="space-y-1">
                <li>Total Templates: {businessContentTemplates.length}</li>
                <li>Selected: {selectedTemplate || 'None'}</li>
                <li>Interactions: {interactionLog.length}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">System Status</h4>
              <ul className="space-y-1">
                <li>✅ BusinessContentRenderer loaded</li>
                <li>✅ Templates available</li>
                <li>✅ User context set</li>
                <li>✅ Interaction handling active</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
