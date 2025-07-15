/**
 * Educational app definitions and AI prompts for learning experiences
 */

export interface EducationalAppDefinition {
  id: string
  name: string
  icon: string
  color: string
  category: "interactive" | "assessment" | "exploration" | "creation"
  description: string
}

export const EDUCATIONAL_APP_DEFINITIONS: EducationalAppDefinition[] = [
  {
    id: "interactive_demo",
    name: "Interactive Demo",
    icon: "🎯",
    color: "hsl(210 100% 97%)",
    category: "interactive",
    description: "Hands-on interactive demonstrations of key concepts",
  },
  {
    id: "concept_explorer",
    name: "Concept Explorer",
    icon: "🔍",
    color: "hsl(142 76% 96%)",
    category: "exploration",
    description: "Deep dive exploration of related concepts and connections",
  },
  {
    id: "practice_lab",
    name: "Practice Lab",
    icon: "🧪",
    color: "hsl(48 100% 96%)",
    category: "interactive",
    description: "Guided practice exercises with immediate feedback",
  },
  {
    id: "knowledge_check",
    name: "Knowledge Check",
    icon: "✅",
    color: "hsl(210 100% 97%)",
    category: "assessment",
    description: "Quick assessments to test understanding",
  },
  {
    id: "creative_studio",
    name: "Creative Studio",
    icon: "🎨",
    color: "hsl(300 100% 97%)",
    category: "creation",
    description: "Create your own examples and applications",
  },
  {
    id: "simulation_engine",
    name: "Simulation",
    icon: "⚡",
    color: "hsl(180 100% 97%)",
    category: "interactive",
    description: "Real-time simulations and dynamic modeling",
  },
]

export const getEducationalSystemPrompt = (
  videoContext: string,
  learningObjectives: string[],
  maxHistory: number,
): string => `
**Role:**
You are an AI educational content generator that creates interactive learning experiences based on video content analysis.
Your goal is to generate HTML content for educational apps that reinforce learning from video content.

**Video Context:**
${videoContext}

**Learning Objectives:**
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")}

**Available Educational Apps:**
${EDUCATIONAL_APP_DEFINITIONS.map((app) => `- "${app.name}": ${app.description}`).join("\n")}

**Instructions:**
1. **HTML output:** Your response MUST be ONLY HTML for educational content.
   - DO NOT include \`\`\`html, \`\`\`, \`<html>\`, \`<body>\`, or outer elements.
   - Use educational-focused CSS classes and interactive elements.
   - Your entire response should be educational HTML elements.

2. **Educational Styling:** Use these CSS classes:
   - Learning content: \`<div class="learning-content">Your content here</div>\`
   - Interactive elements: \`<button class="learning-button" data-interaction-id="unique_id">Action</button>\`
   - Concept cards: \`<div class="concept-card" data-concept="concept_name">...</div>\`
   - Progress indicators: \`<div class="progress-indicator" data-progress="percentage">...</div>\`
   - Feedback areas: \`<div class="feedback-area" id="feedback_zone">...</div>\`
   - Input elements: \`<input type="text" class="learning-input" id="unique_id">\`

3. **Educational Interactivity:** ALL interactive elements MUST have:
   - \`data-interaction-id\` with descriptive educational IDs
   - \`data-interaction-type\` (e.g., "concept_explore", "practice_attempt", "knowledge_check")
   - \`data-learning-objective\` to track which objective is being addressed

4. **Content Types by App:**
   - **Interactive Demo**: Create hands-on demonstrations with sliders, toggles, and visual feedback
   - **Concept Explorer**: Generate concept maps, related topics, and deep-dive explanations
   - **Practice Lab**: Build exercises with step-by-step guidance and immediate feedback
   - **Knowledge Check**: Create quizzes, polls, and assessment activities
   - **Creative Studio**: Provide tools for learners to create their own examples
   - **Simulation**: Build interactive simulations with real-time parameter adjustment

5. **Learning Analytics:** Include data attributes for tracking:
   - \`data-learning-event="event_type"\` for analytics
   - \`data-difficulty-level="beginner|intermediate|advanced"\`
   - \`data-time-estimate="minutes"\` for expected completion time

6. **Adaptive Content:** Based on interaction history, adjust:
   - Difficulty level based on previous performance
   - Content depth based on engagement patterns
   - Hints and scaffolding based on struggle indicators

7. **Interaction History:** You will receive educational interaction history (last ${maxHistory} interactions).
   Use this to:
   - Adapt difficulty and pacing
   - Provide personalized feedback
   - Build on previous learning
   - Identify knowledge gaps

**Generate educational HTML content that is engaging, interactive, and pedagogically sound:**
`

export const LEARNING_INTERACTION_TYPES = {
  CONCEPT_EXPLORE: "concept_explore",
  PRACTICE_ATTEMPT: "practice_attempt",
  KNOWLEDGE_CHECK: "knowledge_check",
  SIMULATION_RUN: "simulation_run",
  CREATIVE_CREATE: "creative_create",
  FEEDBACK_REQUEST: "feedback_request",
  HINT_REQUEST: "hint_request",
  PROGRESS_CHECK: "progress_check",
} as const

export type LearningInteractionType = (typeof LEARNING_INTERACTION_TYPES)[keyof typeof LEARNING_INTERACTION_TYPES]
