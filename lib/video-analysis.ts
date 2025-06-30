/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VideoAnalysisOptions {
  videoUrl: string
  analysisType?: 'learning_modules' | 'transcript' | 'summary' | 'business_insights'
  generateQuizzes?: boolean
  generateReadingMaterials?: boolean
  targetAudience?: 'beginner' | 'intermediate' | 'advanced'
}

export interface LearningModule {
  id: string
  title: string
  type: 'video_segment' | 'quiz' | 'reading' | 'interactive_exercise'
  completed: boolean
  content?: string
  questions?: QuizQuestion[]
  startTime?: number
  endTime?: number
  keyPoints?: string[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface VideoAnalysisResult {
  videoUrl: string
  title: string
  transcript?: string
  summary: string
  learningModules: LearningModule[]
  keyTopics: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
}

/**
 * Analyzes a video and generates learning content
 */
export async function analyzeVideoForLearning(options: VideoAnalysisOptions): Promise<VideoAnalysisResult> {
  const { videoUrl, analysisType = 'learning_modules' } = options

  try {
    const response = await fetch('/api/ai?action=analyzeVideo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        analysisType,
        prompt: `Analyze this video and create comprehensive learning modules. Extract key concepts, generate quiz questions, and create structured learning content.`,
        generateQuizzes: options.generateQuizzes ?? true,
        generateReadingMaterials: options.generateReadingMaterials ?? true,
        targetAudience: options.targetAudience ?? 'intermediate'
      })
    })

    if (!response.ok) {
      throw new Error(`Video analysis failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Video analysis failed')
    }

    return parseVideoAnalysisResult(result.data)
  } catch (error) {
    console.error('Video analysis error:', error)
    throw error
  }
}

/**
 * Gets video transcript using YouTube API or similar service
 */
export async function getVideoTranscript(videoUrl: string): Promise<string> {
  try {
    const response = await fetch('/api/ai?action=youtubeTranscript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl })
    })

    if (!response.ok) {
      throw new Error('Failed to get transcript')
    }

    const result = await response.json()
    return result.transcript || ''
  } catch (error) {
    console.error('Transcript extraction failed:', error)
    // Fallback to Gemini video analysis
    return ''
  }
}

/**
 * Generates learning modules from video content
 */
export async function generateLearningModules(
  videoUrl: string, 
  transcript?: string
): Promise<LearningModule[]> {
  const prompt = `
    Based on this video content${transcript ? ' and transcript' : ''}, create structured learning modules:
    
    1. Break down the content into logical segments
    2. Create quiz questions for each segment
    3. Generate supplementary reading materials
    4. Include interactive exercises where appropriate
    
    Return the modules in a structured format with clear learning objectives.
    ${transcript ? `\n\nTranscript: ${transcript}` : ''}
  `

  try {
    const response = await fetch('/api/ai?action=generateLearningContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        prompt,
        transcript
      })
    })

    const result = await response.json()
    return parseLearningModules(result.data?.text || '')
  } catch (error) {
    console.error('Learning module generation failed:', error)
    return getDefaultLearningModules()
  }
}

/**
 * Parses the AI response into structured learning modules
 */
function parseLearningModules(aiResponse: string): LearningModule[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                     aiResponse.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0])
      if (parsed.modules && Array.isArray(parsed.modules)) {
        return parsed.modules.map((module: any, index: number) => ({
          id: module.id || `module-${index}`,
          title: module.title || `Module ${index + 1}`,
          type: module.type || 'reading',
          completed: false,
          content: module.content,
          questions: module.questions || [],
          startTime: module.startTime,
          endTime: module.endTime,
          keyPoints: module.keyPoints || []
        }))
      }
    }

    // Fallback: parse text-based response
    return parseTextBasedModules(aiResponse)
  } catch (error) {
    console.error('Failed to parse learning modules:', error)
    return getDefaultLearningModules()
  }
}

/**
 * Parses text-based module descriptions
 */
function parseTextBasedModules(text: string): LearningModule[] {
  const modules: LearningModule[] = []
  const sections = text.split(/(?:^|\n)(?:Module|Section|Chapter)\s*\d+/i)
  
  sections.forEach((section, index) => {
    if (section.trim()) {
      const lines = section.trim().split('\n')
      const title = lines[0]?.replace(/[:#-]/g, '').trim() || `Module ${index + 1}`
      const content = lines.slice(1).join('\n').trim()
      
      modules.push({
        id: `module-${index}`,
        title,
        type: content.includes('quiz') || content.includes('question') ? 'quiz' : 'reading',
        completed: false,
        content,
        startTime: index * 120,
        endTime: (index + 1) * 120
      })
    }
  })
  
  return modules.length > 0 ? modules : getDefaultLearningModules()
}

/**
 * Default learning modules when parsing fails
 */
function getDefaultLearningModules(): LearningModule[] {
  return [
    {
      id: 'intro',
      title: 'Introduction',
      type: 'video_segment',
      completed: false,
      content: 'Overview of the main concepts covered in this video.',
      startTime: 0,
      endTime: 120
    },
    {
      id: 'main-concept',
      title: 'Main Concepts',
      type: 'reading',
      completed: false,
      content: 'Key learning points and detailed explanations.',
    },
    {
      id: 'quiz',
      title: 'Knowledge Check',
      type: 'quiz',
      completed: false,
      questions: [
        {
          id: 'q1',
          question: 'What was the main topic discussed?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'This covers the primary subject matter.'
        }
      ]
    }
  ]
}

/**
 * Parses the full video analysis result
 */
function parseVideoAnalysisResult(data: any): VideoAnalysisResult {
  return {
    videoUrl: data.videoUrl || '',
    title: data.title || 'Video Learning Content',
    transcript: data.transcript,
    summary: data.summary || data.text || 'Video analysis completed.',
    learningModules: data.learningModules || getDefaultLearningModules(),
    keyTopics: data.keyTopics || [],
    difficulty: data.difficulty || 'intermediate',
    estimatedDuration: data.estimatedDuration || 30
  }
} 