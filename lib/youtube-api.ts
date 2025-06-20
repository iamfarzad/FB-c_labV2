/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  description: string
  duration: number
  channelTitle: string
  publishedAt: string
  thumbnails: {
    default: string
    medium: string
    high: string
  }
}

export interface TranscriptSegment {
  start: number
  duration: number
  text: string
}

/**
 * Extracts video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Gets video information using YouTube Data API v3
 */
export async function getVideoInfo(videoUrl: string): Promise<YouTubeVideoInfo | null> {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return null

  try {
    // First try our backend API
    const response = await fetch('/api/youtube-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    })

    if (response.ok) {
      const data = await response.json()
      return data.videoInfo
    }

    // Fallback to oEmbed API for basic info
    const oEmbedResponse = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
    )

    if (oEmbedResponse.ok) {
      const oEmbedData = await oEmbedResponse.json()
      return {
        videoId,
        title: oEmbedData.title || 'YouTube Video',
        description: '',
        duration: 0,
        channelTitle: oEmbedData.author_name || '',
        publishedAt: '',
        thumbnails: {
          default: oEmbedData.thumbnail_url || '',
          medium: oEmbedData.thumbnail_url || '',
          high: oEmbedData.thumbnail_url || ''
        }
      }
    }

    return null
  } catch (error) {
    console.error('Failed to get video info:', error)
    return null
  }
}

/**
 * Gets video transcript using various methods
 */
export async function getVideoTranscript(videoUrl: string): Promise<TranscriptSegment[]> {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return []

  try {
    // Try our backend transcript API
    const response = await fetch('/api/youtube-transcript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, videoUrl })
    })

    if (response.ok) {
      const data = await response.json()
      return data.transcript || []
    }

    // Fallback: return empty array if transcript not available
    console.warn('Transcript not available for video:', videoId)
    return []
  } catch (error) {
    console.error('Failed to get transcript:', error)
    return []
  }
}

/**
 * Converts transcript segments to plain text
 */
export function transcriptToText(segments: TranscriptSegment[]): string {
  return segments.map(segment => segment.text).join(' ')
}

/**
 * Finds transcript segments within a time range
 */
export function getTranscriptSegments(
  segments: TranscriptSegment[],
  startTime: number,
  endTime: number
): TranscriptSegment[] {
  return segments.filter(segment => {
    const segmentEnd = segment.start + segment.duration
    return segment.start < endTime && segmentEnd > startTime
  })
}

/**
 * Validates YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}

/**
 * Generates YouTube embed URL
 */
export function getEmbedUrl(videoUrl: string, options?: {
  autoplay?: boolean
  start?: number
  end?: number
  controls?: boolean
}): string {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return ''

  const params = new URLSearchParams()
  
  if (options?.autoplay) params.set('autoplay', '1')
  if (options?.start) params.set('start', options.start.toString())
  if (options?.end) params.set('end', options.end.toString())
  if (options?.controls === false) params.set('controls', '0')

  const queryString = params.toString()
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`
}

/**
 * Gets video thumbnail URL
 */
export function getThumbnailUrl(videoUrl: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return ''

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  }

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Formats duration from seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Parses duration from YouTube API format (PT4M13S)
 */
export function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  return hours * 3600 + minutes * 60 + seconds
} 