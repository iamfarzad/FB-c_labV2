/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This module provides a comprehensive set of utility functions for interacting with YouTube.
 * It combines robust regex-based extraction with API calls for fetching video details and transcripts,
 * ensuring a reliable and full-featured interface for YouTube-related operations.
 */

import { NextRequest, NextResponse } from 'next/server';

// #region Type Definitions

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
  };
}

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

// #endregion

// #region Core Utility Functions

/**
 * Extracts the YouTube video ID from a URL.
 * Supports standard, shortened, and embed URLs.
 */
export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Creates a YouTube embed URL from a video URL.
 */
export function getYoutubeEmbedUrl(videoUrl: string): string {
  const videoId = extractVideoId(videoUrl);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
}

/**
 * Validates a YouTube URL.
 */
export function validateYoutubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * Fetches the title of a YouTube video using the oEmbed endpoint.
 */
export async function getYouTubeVideoTitle(url:string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return 'Untitled Video';
  }
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!response.ok) {
      throw new Error('Failed to fetch video title');
    }
    const data = await response.json();
    return data.title || 'Untitled Video';
  } catch (error) {
    console.error('Error fetching YouTube video title:', error);
    return 'Untitled Video';
  }
}

/**
 * Gets the URL for a video's thumbnail image.
 * @param videoUrl The source YouTube URL.
 * @param quality The desired thumbnail quality.
 * @returns The URL of the thumbnail image, or an empty string if the ID is not found.
 */
export function getThumbnailUrl(
  videoUrl: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium',
): string {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return '';

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

// #endregion

// #region API-based Functions

/**
 * Fetches detailed information for a YouTube video.
 * It first tries a dedicated backend API endpoint and falls back to the oEmbed API.
 * @param videoUrl The URL of the YouTube video.
 * @returns A promise that resolves to a `YouTubeVideoInfo` object, or null if not found.
 */
export async function getVideoInfo(videoUrl: string): Promise<YouTubeVideoInfo | null> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return null;

  try {
    // Primary method: Use our own backend API which should use the YouTube Data API v3
    const response = await fetch('/api/youtube-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.videoInfo) return data.videoInfo;
    }

    // Fallback method: Use the public oEmbed API for basic info
    const oEmbedResponse = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
    );

    if (oEmbedResponse.ok) {
      const oEmbedData = await oEmbedResponse.json();
      return {
        videoId,
        title: oEmbedData.title || 'YouTube Video',
        description: '', // oEmbed does not provide description
        duration: 0, // oEmbed does not provide duration
        channelTitle: oEmbedData.author_name || '',
        publishedAt: '', // oEmbed does not provide publish date
        thumbnails: {
          default: oEmbedData.thumbnail_url || '',
          medium: oEmbedData.thumbnail_url || '',
          high: oEmbedData.thumbnail_url || '',
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get video info:', error);
    return null;
  }
}

/**
 * Fetches the transcript for a given YouTube video.
 * @param videoUrl The URL of the video.
 * @param format The desired format ('text' or 'segments').
 * @returns A promise that resolves to the transcript as a string or an array of segments.
 */
export async function getVideoTranscript(
  videoUrl: string,
  format: 'text' | 'segments' = 'segments',
): Promise<string | TranscriptSegment[]> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) return format === 'text' ? '' : [];

  try {
    const response = await fetch('/api/ai?action=youtubeTranscript', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, videoUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      const transcript = data.transcript || [];
      return format === 'text' ? transcriptToText(transcript) : transcript;
    }

    console.warn('Transcript not available for video:', videoId);
    return format === 'text' ? '' : [];
  } catch (error) {
    console.error('Failed to get transcript:', error);
    return format === 'text' ? '' : [];
  }
}

// #endregion

// #region Transcript & Duration Helpers

/**
 * Converts an array of transcript segments into a single plain text string.
 * @param segments The array of `TranscriptSegment`.
 * @returns A single string containing all the text from the segments.
 */
export function transcriptToText(segments: TranscriptSegment[]): string {
  return segments.map(segment => segment.text).join(' ');
}

/**
 * Filters transcript segments to find those within a specific time range.
 * @param segments The full array of transcript segments.
 * @param startTime The start of the time range in seconds.
 * @param endTime The end of the time range in seconds.
 * @returns An array of segments that fall within the time range.
 */
export function getTranscriptSegments(
  segments: TranscriptSegment[],
  startTime: number,
  endTime: number,
): TranscriptSegment[] {
  return segments.filter(segment => {
    const segmentEnd = segment.start + segment.duration;
    return segment.start < endTime && segmentEnd > startTime;
  });
}

/**
 * Formats a duration from seconds into a readable HH:MM:SS or MM:SS format.
 * @param seconds The duration in seconds.
 * @returns A formatted string.
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses a YouTube API duration string (e.g., "PT4M13S") into seconds.
 * @param duration The ISO 8601 duration string from the YouTube API.
 * @returns The total duration in seconds.
 */
export function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

// #endregion 