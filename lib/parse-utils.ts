/**
 * Parsing utilities for AI responses
 */

export const parseJSON = (str: string) => {
  try {
    // First try to parse the entire string as JSON
    return JSON.parse(str)
  } catch (e) {
    // If that fails, try to extract JSON from the string
    const start = str.indexOf("{")
    const end = str.lastIndexOf("}") + 1
    
    if (start === -1 || end === 0) {
      throw new Error("No JSON object found in string")
    }
    
    const jsonStr = str.substring(start, end)
    try {
      return JSON.parse(jsonStr)
    } catch (parseError) {
      throw new Error(`Failed to parse JSON: ${parseError}`)
    }
  }
}

export const parseHTML = (str: string, opener: string, closer: string) => {
  // Try to find HTML content between code blocks
  const codeBlockStart = str.indexOf(opener)
  const codeBlockEnd = str.lastIndexOf(closer)
  
  if (codeBlockStart !== -1 && codeBlockEnd !== -1 && codeBlockEnd > codeBlockStart) {
    const content = str.substring(codeBlockStart + opener.length, codeBlockEnd).trim()
    
    // Look for HTML content within the code block
    const htmlStart = content.indexOf("<!DOCTYPE html>")
    if (htmlStart !== -1) {
      return content.substring(htmlStart)
    }
    
    // If no DOCTYPE, look for <html> tag
    const htmlTagStart = content.indexOf("<html")
    if (htmlTagStart !== -1) {
      return content.substring(htmlTagStart)
    }
    
    // If no HTML tags found, return the entire code block content
    return content
  }
  
  // Fallback: look for HTML content directly in the string
  const htmlStart = str.indexOf("<!DOCTYPE html>")
  if (htmlStart !== -1) {
    return str.substring(htmlStart)
  }
  
  const htmlTagStart = str.indexOf("<html")
  if (htmlTagStart !== -1) {
    return str.substring(htmlTagStart)
  }
  
  // If no HTML found, return the original string
  return str
}
