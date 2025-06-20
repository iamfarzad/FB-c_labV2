// @/lib/youtube.ts

// Function to detect YouTube URL and extract standardized watch URL
export function detectYouTubeUrl(text: string): string | null {
  if (!text || typeof text !== 'string') return null;
  // Regex to capture video ID from various YouTube URL formats including shorts
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/g;
  youtubeRegex.lastIndex = 0; // Reset lastIndex for global regex if it's to be reused safely
  const match = youtubeRegex.exec(text);
  // Return the full watch URL if a match is found
  return match ? `https://www.youtube.com/watch?v=${match[1]}` : null;
}

// Async function to get video title (Placeholder)
export async function getVideoTitle(url: string): Promise<string> {
  console.log(`getVideoTitle (placeholder) called for: ${url}`);
  try {
    // Attempt to parse URL and extract video ID for a slightly better placeholder title
    const videoId = new URL(url).searchParams.get('v');
    if (videoId) {
      return `Video: ${videoId}`; // Placeholder title
    }
  } catch (e) {
    // Fallback for invalid URLs or if 'v' param is not found (e.g. youtu.be links before standardization)
    const shortIdMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortIdMatch && shortIdMatch[1]) {
        return `Video: ${shortIdMatch[1]}`;
    }
    // Fallback for already standardized URLs that might fail URL constructor if not full (though detectYouTubeUrl should prevent this)
    const standardIdMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (standardIdMatch && standardIdMatch[1]) {
        return `Video: ${standardIdMatch[1]}`;
    }
    console.error("Error parsing URL for getVideoTitle placeholder:", e);
  }
  return "YouTube Video (Title Unavailable)"; // Generic placeholder
}

// --- Other existing functions from the file ---
export function getYoutubeEmbedUrl(url: string): string {
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : 'about:blank';
}

export async function validateYoutubeUrl(url: string): Promise<{isValid: boolean, error?: string}> {
  console.warn("Placeholder: validateYoutubeUrl called for", url);
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const isValid = youtubeRegex.test(url);
  return { isValid, error: isValid ? undefined : "Invalid YouTube URL format (Placeholder Validation)" };
}
