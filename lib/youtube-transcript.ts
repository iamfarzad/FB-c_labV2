/**
 * YouTube transcript extraction service
 * Uses youtube-transcript library to extract video transcripts
 */

interface TranscriptItem {
  text: string
  duration: number
  offset: number
}

interface VideoTranscript {
  transcript: string
  items: TranscriptItem[]
  videoId: string
  title?: string
}

/**
 * Extract transcript from YouTube video
 */
export async function getYouTubeTranscript(videoUrl: string): Promise<VideoTranscript> {
  const { getYouTubeVideoId } = await import('./youtube')
  
  const videoId = getYouTubeVideoId(videoUrl)
  if (!videoId) {
    throw new Error('Invalid YouTube URL')
  }

  try {
    // Try to get transcript using youtube-transcript
    const { YoutubeTranscript } = await import('youtube-transcript')
    
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
      country: 'US'
    })

    // Combine all transcript items into a single text
    const fullTranscript = transcriptItems
      .map((item: any) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Get video title
    let title: string | undefined
    try {
      const { getYouTubeVideoTitle } = await import('./youtube')
      title = await getYouTubeVideoTitle(videoUrl)
    } catch (e) {
      console.warn('Could not fetch video title:', e)
    }

    return {
      transcript: fullTranscript,
      items: transcriptItems.map((item: any) => ({
        text: item.text,
        duration: item.duration,
        offset: item.offset
      })),
      videoId,
      title
    }
  } catch (error) {
    console.error('Failed to extract transcript:', error)
    
    // Fallback: Try alternative method or provide helpful error
    if (error instanceof Error) {
      if (error.message.includes('Transcript is disabled')) {
        throw new Error('This video has disabled transcripts. Please try a different video.')
      }
      if (error.message.includes('No transcript found')) {
        throw new Error('No transcript available for this video. Please try a video with captions enabled.')
      }
    }
    
    throw new Error('Failed to extract video transcript. The video may not have captions available.')
  }
}

/**
 * Summarize transcript for AI processing
 * Reduces very long transcripts to key points
 */
export function summarizeTranscript(transcript: string, maxLength: number = 4000): string {
  if (transcript.length <= maxLength) {
    return transcript
  }

  // Split into sentences and take the most important ones
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10)
  
  // Take first 30% and last 30% of sentences (usually intro and conclusion are important)
  const firstPart = Math.floor(sentences.length * 0.3)
  const lastPart = Math.floor(sentences.length * 0.3)
  
  const importantSentences = [
    ...sentences.slice(0, firstPart),
    ...sentences.slice(-lastPart)
  ]
  
  let summary = importantSentences.join('. ').trim()
  
  // If still too long, truncate
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...'
  }
  
  return summary
}

/**
 * Extract key topics from transcript
 */
export function extractKeyTopics(transcript: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
    'his', 'her', 'its', 'our', 'their', 'so', 'if', 'when', 'where', 'why', 'how', 'what', 'who'
  ])

  const words = transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))

  // Count word frequency
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })

  // Get top 10 most frequent words as topics
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}
