/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const parseJSON = (str: string) => {
  try {
    // First, try to parse the entire string as JSON
    return JSON.parse(str)
  } catch {
    try {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = str.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }

      // If no code blocks, try to find JSON object boundaries
      const start = str.indexOf("{")
      const end = str.lastIndexOf("}") + 1

      if (start === -1 || end === 0) {
        throw new Error("No JSON object found in response")
      }

      const jsonStr = str.substring(start, end)
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      console.error("Original string:", str)

      // Return a fallback object
      return {
        spec: str.includes("spec") ? str : "Failed to generate specification from video",
        error: "JSON parsing failed"
      }
    }
  }
}

export const parseHTML = (str: string, opener: string, closer: string) => {
  const start = str.indexOf("<!DOCTYPE html>")
  const end = str.lastIndexOf(closer)
  return str.substring(start, end)
}
