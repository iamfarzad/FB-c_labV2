/**
 * Educational AI service for generating learning content
 */

import { GoogleGenerativeAI } from "@google/generative-ai"
import { EDUCATIONAL_APP_DEFINITIONS, getEducationalSystemPrompt } from "./education-constants"

export interface EducationalInteractionData {
  id: string
  type: string
  value?: string
  elementType: string
  elementText: string
  appContext: string | null
  learningObjective?: string
  difficultyLevel?: "beginner" | "intermediate" | "advanced"
  timeSpent?: number
  isCorrect?: boolean
  timestamp: number
}

export interface VideoLearningContext {
  videoUrl: string
  videoTitle?: string
  generatedSpec: string
  learningObjectives: string[]
  keyTopics: string[]
  difficultyLevel: "beginner" | "intermediate" | "advanced"
}

const getGeminiClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("Gemini client should only be used on the server side")
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  return new GoogleGenerativeAI(apiKey)
}

export async function* streamEducationalContent(
  interactionHistory: EducationalInteractionData[],
  videoContext: VideoLearningContext,
  currentMaxHistoryLength: number,
): AsyncGenerator<string, void, void> {
  // Use the current stable model
  const modelName = "gemini-2.5-flash"

  try {
    const genAI = getGeminiClient()

    if (interactionHistory.length === 0) {
      yield `<div class="p-4 text-orange-700 bg-orange-100 rounded-lg">
        <p class="font-bold text-lg">No interaction data provided.</p>
      </div>`
      return
    }

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    })

    const systemPrompt = getEducationalSystemPrompt(
      `Video: ${videoContext.videoTitle || videoContext.videoUrl}
      Spec: ${videoContext.generatedSpec}
      Key Topics: ${videoContext.keyTopics.join(", ")}
      Difficulty: ${videoContext.difficultyLevel}`,
      videoContext.learningObjectives,
      currentMaxHistoryLength,
    )

    const currentInteraction = interactionHistory[0]
    const pastInteractions = interactionHistory.slice(1)

    // Build educational context
    const currentElementName = currentInteraction.elementText || currentInteraction.id || "Unknown Element"
    let currentInteractionSummary = `Current Learning Interaction: User interacted with '${currentElementName}' (Type: ${currentInteraction.type}, ID: ${currentInteraction.id}).`

    if (currentInteraction.value) {
      currentInteractionSummary += ` Input value: '${currentInteraction.value.substring(0, 100)}'.`
    }

    if (currentInteraction.learningObjective) {
      currentInteractionSummary += ` Learning objective: ${currentInteraction.learningObjective}.`
    }

    const currentAppDef = EDUCATIONAL_APP_DEFINITIONS.find((app) => app.id === currentInteraction.appContext)
    const currentAppContext = currentInteraction.appContext
      ? `Current Educational App: '${currentAppDef?.name || currentInteraction.appContext}' (${currentAppDef?.description || "Educational tool"}).`
      : "No specific educational app context."

    // Analyze learning patterns from history
    let learningAnalysis = ""
    if (pastInteractions.length > 0) {
      const correctAnswers = pastInteractions.filter((i) => i.isCorrect === true).length
      const totalAttempts = pastInteractions.filter((i) => i.isCorrect !== undefined).length
      const averageTimeSpent =
        pastInteractions.filter((i) => i.timeSpent).reduce((sum, i) => sum + (i.timeSpent || 0), 0) /
        pastInteractions.length

      learningAnalysis = `
Learning Performance Analysis:
- Accuracy: ${totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : "N/A"}% (${correctAnswers}/${totalAttempts})
- Average time per interaction: ${averageTimeSpent ? Math.round(averageTimeSpent) : "N/A"} seconds
- Learning pattern: ${correctAnswers / totalAttempts > 0.8 ? "Strong understanding" : correctAnswers / totalAttempts > 0.6 ? "Good progress" : "Needs support"}
`
    }

    let historyPromptSegment = ""
    if (pastInteractions.length > 0) {
      historyPromptSegment = `\n\nPrevious Learning Interactions (${pastInteractions.length} most recent):`

      pastInteractions.forEach((interaction, index) => {
        const pastElementName = interaction.elementText || interaction.id || "Unknown Element"
        const appDef = EDUCATIONAL_APP_DEFINITIONS.find((app) => app.id === interaction.appContext)
        const appName = interaction.appContext ? appDef?.name || interaction.appContext : "N/A"

        historyPromptSegment += `\n${index + 1}. (App: ${appName}) '${pastElementName}' (${interaction.type})`

        if (interaction.isCorrect !== undefined) {
          historyPromptSegment += ` - ${interaction.isCorrect ? "Correct" : "Incorrect"}`
        }

        if (interaction.timeSpent) {
          historyPromptSegment += ` - ${interaction.timeSpent}s`
        }
      })
    }

    const fullPrompt = `${systemPrompt}

${currentInteractionSummary}
${currentAppContext}
${learningAnalysis}
${historyPromptSegment}

Video Learning Context:
- Video: ${videoContext.videoTitle || "Educational Video"}
- Key Topics: ${videoContext.keyTopics.join(", ")}
- Learning Objectives: ${videoContext.learningObjectives.join("; ")}
- Target Difficulty: ${videoContext.difficultyLevel}

Generate educational HTML content that builds on this context and interaction history:`

    const result = await model.generateContentStream(fullPrompt)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  } catch (error) {
    console.error("Error streaming educational content from Gemini:", error)

    let errorMessage = "An error occurred while generating educational content."
    if (error instanceof Error) {
      errorMessage += ` Details: ${error.message}`
    }

    yield `<div class="p-4 text-red-700 bg-red-100 rounded-lg">
      <p class="font-bold text-lg">Error Generating Educational Content</p>
      <p class="mt-2">${errorMessage}</p>
      <p class="mt-1">Please check your API configuration and try again.</p>
    </div>`
  }
}

export function extractLearningObjectives(videoSpec: string): string[] {
  // Extract learning objectives from the generated spec
  const objectives: string[] = []

  // Look for numbered lists or bullet points that might be objectives
  const lines = videoSpec.split("\n")
  let inObjectivesSection = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Check if we're entering an objectives section
    if (
      trimmed.toLowerCase().includes("objective") ||
      trimmed.toLowerCase().includes("goal") ||
      trimmed.toLowerCase().includes("learn")
    ) {
      inObjectivesSection = true
      continue
    }

    // Extract numbered or bulleted items
    if (inObjectivesSection && (trimmed.match(/^\d+\./) || trimmed.startsWith("-") || trimmed.startsWith("*"))) {
      const objective = trimmed
        .replace(/^\d+\.\s*/, "")
        .replace(/^[-*]\s*/, "")
        .trim()
      if (objective.length > 10) {
        // Filter out very short items
        objectives.push(objective)
      }
    }

    // Stop if we hit an empty line or new section
    if (inObjectivesSection && trimmed === "") {
      break
    }
  }

  // Fallback: extract key concepts if no explicit objectives found
  if (objectives.length === 0) {
    const specLower = videoSpec.toLowerCase()
    if (specLower.includes("understand")) {
      objectives.push("Understand the key concepts presented in the video")
    }
    if (specLower.includes("interactive") || specLower.includes("practice")) {
      objectives.push("Practice applying concepts through interactive exercises")
    }
    if (specLower.includes("demonstrate") || specLower.includes("show")) {
      objectives.push("Demonstrate understanding through hands-on activities")
    }
  }

  return objectives.slice(0, 5) // Limit to 5 objectives
}

export function extractKeyTopics(videoSpec: string): string[] {
  const topics: string[] = []

  // Look for capitalized terms and technical concepts
  const words = videoSpec.split(/\s+/)
  const capitalizedWords = words.filter(
    (word) =>
      word.length > 3 &&
      word[0] === word[0].toUpperCase() &&
      !word.match(/^[A-Z]+$/) && // Not all caps
      !["The", "This", "That", "When", "Where", "What", "How", "Why"].includes(word),
  )

  // Get unique capitalized words as potential topics
  const uniqueTopics = [...new Set(capitalizedWords)].slice(0, 8) // Limit to 8 topics

  return uniqueTopics
}
