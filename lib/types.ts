/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Example {
  title: string
  url: string
  spec: string
  code: string
  description?: string
  category?: "general" | "vision" | "audio" | "text" | "creative"
  tags?: string[]
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimatedTime?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  imageUrl?: string
  metadata?: {
    model?: string
    tokens?: number
    processingTime?: number
  }
}

export interface AIConfig {
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface VoiceConfig {
  language: string
  voice?: string
  rate?: number
  pitch?: number
}

export interface CameraConfig {
  resolution: "low" | "medium" | "high"
  frameRate: number
  captureInterval: number
}

export interface AppSettings {
  theme: "light" | "dark" | "auto"
  aiConfig: AIConfig
  voiceConfig: VoiceConfig
  cameraConfig: CameraConfig
  enableAnalytics: boolean
  autoSave: boolean
}
