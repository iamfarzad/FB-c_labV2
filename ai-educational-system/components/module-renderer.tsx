"use client"

import type { Module } from "@/lib/modules"
import AIHierarchyVisual from "@/components/modules/ai-hierarchy-visual"
import LLMParameterGrowth from "@/components/modules/llm-parameter-growth"
import TokenizationVisualizer from "@/components/modules/tokenization-visualizer"
import AttentionMechanismDemo from "@/components/modules/attention-mechanism-demo"
import EmbeddingExplorer from "@/components/modules/embedding-explorer"
import PromptEngineeringSandbox from "@/components/modules/prompt-engineering-sandbox"
import TemperatureSamplingControls from "@/components/modules/temperature-sampling-controls"
import CustomizationModes from "@/components/modules/customization-modes"
import CostSpeedChart from "@/components/modules/cost-speed-chart"
import HallucinationChecker from "@/components/modules/hallucination-checker"
import BiasExplorer from "@/components/modules/bias-explorer"
import ReasoningVisualizer from "@/components/modules/reasoning-visualizer"

export default function ModuleRenderer({ module }: { module: Module }) {
  // Render the appropriate module component based on the slug
  switch (module.slug) {
    case "ai-hierarchy-visual":
      return <AIHierarchyVisual />
    case "llm-parameter-growth":
      return <LLMParameterGrowth />
    case "tokenization-visualizer":
      return <TokenizationVisualizer />
    case "attention-mechanism-demo":
      return <AttentionMechanismDemo />
    case "embedding-explorer":
      return <EmbeddingExplorer />
    case "prompt-engineering-sandbox":
      return <PromptEngineeringSandbox />
    case "temperature-sampling-controls":
      return <TemperatureSamplingControls />
    case "customization-modes":
      return <CustomizationModes />
    case "cost-speed-chart":
      return <CostSpeedChart />
    case "hallucination-checker":
      return <HallucinationChecker />
    case "bias-explorer":
      return <BiasExplorer />
    case "reasoning-visualizer":
      return <ReasoningVisualizer />
    default:
      return (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Module content coming soon...</p>
        </div>
      )
  }
}

