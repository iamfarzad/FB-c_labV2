'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mic, 
  Camera, 
  Monitor, 
  Calculator, 
  Play, 
  FileText, 
  ImageIcon,
  Sparkles,
  Zap,
  Settings
} from 'lucide-react'
import { MultimodalInterface } from './MultimodalInterface'
import { VoiceInput } from './VoiceInput'
import { ROICalculator } from './ROICalculator'
import { VideoToApp } from './VideoToApp'

interface ToolConfig {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  component: React.ComponentType<any>
  props?: Record<string, any>
}

interface UnifiedToolPanelProps {
  onToolComplete: (toolId: string, result: any) => void
  onToolCancel?: (toolId: string) => void
  activeTool?: string
  className?: string
  mode?: 'modal' | 'card' | 'inline'
}

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: 'voice',
    name: 'Voice Input',
    description: 'Speak your message with AI transcription',
    icon: Mic,
    color: 'from-purple-500 to-purple-600',
    component: VoiceInput,
    props: { mode: 'card' }
  },
  {
    id: 'multimodal',
    name: 'Multimodal AI',
    description: 'Voice, webcam, and screen sharing with AI analysis',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    component: MultimodalInterface,
    props: { mode: 'card' }
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    description: 'Calculate automation ROI and cost savings',
    icon: Calculator,
    color: 'from-green-500 to-green-600',
    component: ROICalculator,
    props: { mode: 'card' }
  },
  {
    id: 'video2app',
    name: 'Video to App',
    description: 'Convert YouTube videos to interactive learning apps',
    icon: Play,
    color: 'from-orange-500 to-orange-600',
    component: VideoToApp,
    props: { mode: 'card' }
  }
]

export function UnifiedToolPanel({
  onToolComplete,
  onToolCancel,
  activeTool,
  className = '',
  mode = 'card'
}: UnifiedToolPanelProps) {
  const [selectedTool, setSelectedTool] = useState<string>(activeTool || 'multimodal')

  const handleToolComplete = (toolId: string, result: any) => {
    onToolComplete(toolId, result)
    setSelectedTool('multimodal') // Reset to default
  }

  const handleToolCancel = (toolId: string) => {
    onToolCancel?.(toolId)
    setSelectedTool('multimodal') // Reset to default
  }

  const currentTool = TOOL_CONFIGS.find(tool => tool.id === selectedTool)

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <Zap className="w-5 h-5 text-accent" />
          <span>AI Tools</span>
          <Badge variant="secondary" className="ml-auto">
            {TOOL_CONFIGS.length} Tools
          </Badge>
        </CardTitle>
        
        {/* Tool Navigation */}
        <Tabs value={selectedTool} onValueChange={setSelectedTool} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {TOOL_CONFIGS.map((tool) => (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <tool.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tool.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {TOOL_CONFIGS.map((tool) => (
            <TabsContent key={tool.id} value={tool.id} className="space-y-4">
              {/* Tool Header */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.color}`}>
                  <tool.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToolCancel(tool.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Tool Component */}
              <div className="border rounded-lg">
                <tool.component
                  {...tool.props}
                  onComplete={(result: any) => handleToolComplete(tool.id, result)}
                  onCancel={() => handleToolCancel(tool.id)}
                  onAnalysisComplete={(result: any) => handleToolComplete(tool.id, result)}
                  onTranscript={(transcript: string) => handleToolComplete(tool.id, { transcript })}
                  onROICalculation={(result: any) => handleToolComplete(tool.id, result)}
                  onVideoAppResult={(result: any) => handleToolComplete(tool.id, result)}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
    </Card>
  )
}

// Quick access components for individual tools
export function VoiceTool({ onComplete, ...props }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-500" />
          Voice Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VoiceInput mode="card" onTranscript={onComplete} {...props} />
      </CardContent>
    </Card>
  )
}

export function MultimodalTool({ onComplete, ...props }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          Multimodal AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MultimodalInterface mode="card" onAnalysisComplete={onComplete} {...props} />
      </CardContent>
    </Card>
  )
}

export function ROITool({ onComplete, ...props }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-500" />
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ROICalculator mode="card" onComplete={onComplete} {...props} />
      </CardContent>
    </Card>
  )
}

export function VideoToAppTool({ onComplete, ...props }: any) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-orange-500" />
          Video to App
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VideoToApp mode="card" onAnalysisComplete={onComplete} {...props} />
      </CardContent>
    </Card>
  )
} 