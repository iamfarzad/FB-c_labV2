"use client"

import type { ModuleItem } from '@/lib/education/modules'
import AIHierarchyVisual from '@/components/workshop/modules/ai-hierarchy-visual'
import LLMParameterGrowth from '@/components/workshop/modules/llm-parameter-growth'
import TokenizationVisualizer from '@/components/workshop/modules/tokenization-visualizer'
import TemperatureSamplingControls from '@/components/workshop/modules/temperature-sampling-controls'
import PromptEngineeringSandbox from '@/components/workshop/modules/prompt-engineering-sandbox'
import CostSpeedChart from '@/components/workshop/modules/cost-speed-chart'
import BiasExplorer from '@/components/workshop/modules/bias-explorer'
import ReasoningVisualizer from '@/components/workshop/modules/reasoning-visualizer'
import AttentionMechanismDemo from '@/components/workshop/modules/attention-mechanism-demo'
import EmbeddingExplorer from '@/components/workshop/modules/embedding-explorer'
import CustomizationModes from '@/components/workshop/modules/customization-modes'
import HallucinationChecker from '@/components/workshop/modules/hallucination-checker'
import { MODULE_QUIZZES } from '@/lib/education/quizzes'
import { useEffect } from 'react'

export default function ModuleRenderer({ module }: { module: ModuleItem }) {
  useEffect(() => {
    // Ensure quizzes object is referenced so tree-shaking keeps it
    void MODULE_QUIZZES[module.slug]
  }, [module.slug])
  switch (module.slug) {
    case 'ai-hierarchy-visual':
      return <AIHierarchyVisual />
    case 'tokenization-visualizer':
      return <TokenizationVisualizer />
    case 'llm-parameter-growth':
      return <LLMParameterGrowth />
    case 'attention-mechanism-demo':
      return <AttentionMechanismDemo />
    case 'embedding-explorer':
      return <EmbeddingExplorer />
    case 'temperature-sampling-controls':
      return <TemperatureSamplingControls />
    case 'customization-modes':
      return <CustomizationModes />
    case 'prompt-engineering-sandbox':
      return <PromptEngineeringSandbox />
    case 'cost-speed-chart':
      return <CostSpeedChart />
    case 'hallucination-checker':
      return <HallucinationChecker />
    case 'bias-explorer':
      return <BiasExplorer />
    case 'reasoning-visualizer':
      return <ReasoningVisualizer />
    default:
      return <div className="p-8 text-center text-muted-foreground">Module coming soon…</div>
  }
}


