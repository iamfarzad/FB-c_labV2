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

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate text")
    }

    const result = await response.json()
    return result.text || result.summary || ""
  } catch (error) {
    console.error("An error occurred during text generation:", error)
    throw error
  }
}
