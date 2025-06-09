/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface GenerateTextOptions {
  modelName: string
  prompt: string
  videoUrl?: string
  temperature?: number
}

/**
 * Generate text content using the Gemini API, optionally including video data.
 */
export async function generateText(options: GenerateTextOptions): Promise<string> {
  const { modelName, prompt, videoUrl, temperature = 0.75 } = options

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("Gemini API key is missing or empty")
  }

  try {
    const response = await fetch("/api/gemini-proxy?action=generateText", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        model: modelName,
        temperature,
        videoUrl,
      }),
    })

    const result = await response.json()

    if (result.success) {
      return result.data.text
    } else {
      throw new Error(result.error || "Failed to generate text")
    }
  } catch (error) {
    console.error("An error occurred during text generation:", error)
    throw error
  }
}
