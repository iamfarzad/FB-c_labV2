// @/lib/youtube.ts
export function getYoutubeEmbedUrl(url: string): string {
  // Basic parser, you might want a more robust one
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : 'about:blank';
}

export async function getYouTubeVideoTitle(url: string): Promise<string> {
  console.warn("Placeholder: getYouTubeVideoTitle called for", url);
  // In a real app, you might fetch from an oEmbed endpoint or a YouTube API proxy
  // For example:
  // try {
  //   const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
  //   if (!response.ok) throw new Error('Failed to fetch title');
  //   const data = await response.json();
  //   return data.title || "YouTube Video";
  // } catch (error) {
  //   console.error("Error fetching YouTube title:", error);
  //   return "YouTube Video (Error fetching title)";
  // }
  return `Sample Video Title for: ${url.substring(0,30)}... (Placeholder)`;
}

export async function validateYoutubeUrl(url: string): Promise<{isValid: boolean, error?: string}> {
  console.warn("Placeholder: validateYoutubeUrl called for", url);
  // Basic check for youtube.com or youtu.be and video ID pattern
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const isValid = youtubeRegex.test(url);
  return { isValid, error: isValid ? undefined : "Invalid YouTube URL format (Placeholder Validation)" };
}
