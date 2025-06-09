import type { DataItem } from "@/lib/data-types"

export const parseDataFromText = (text: string): DataItem[] => {
  const items: DataItem[] = []
  const id = Date.now().toString()

  // Check for code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let match
  let lastIndex = 0

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    const beforeText = text.slice(lastIndex, match.index).trim()
    if (beforeText) {
      items.push({
        id: `${id}-text-${items.length}`,
        type: "text",
        content: beforeText,
        format: "markdown",
        timestamp: new Date().toISOString(),
      })
    }

    // Add code block
    const language = match[1] || "text"
    const code = match[2].trim()
    items.push({
      id: `${id}-code-${items.length}`,
      type: "code",
      content: code,
      language: language,
      timestamp: new Date().toISOString(),
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  const remainingText = text.slice(lastIndex).trim()
  if (remainingText) {
    items.push({
      id: `${id}-text-${items.length}`,
      type: "text",
      content: remainingText,
      format: "markdown",
      timestamp: new Date().toISOString(),
    })
  }

  // If no code blocks found, return as single text item
  if (items.length === 0) {
    items.push({
      id: `${id}-text-0`,
      type: "text",
      content: text,
      format: "markdown",
      timestamp: new Date().toISOString(),
    })
  }

  return items
}

export const createDataItem = (type: string, content: any, metadata?: any): DataItem => {
  const baseItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    metadata,
  }

  switch (type) {
    case "text":
      return {
        ...baseItem,
        type: "text",
        content: content.text || content,
        format: content.format || "plain",
      }

    case "code":
      return {
        ...baseItem,
        type: "code",
        content: content.code || content,
        language: content.language || "text",
        filename: content.filename,
        description: content.description,
        executable: content.executable || false,
      }

    case "image":
      return {
        ...baseItem,
        type: "image",
        url: content.url || content,
        alt: content.alt,
        caption: content.caption,
        width: content.width,
        height: content.height,
        thumbnail: content.thumbnail,
      }

    case "table":
      return {
        ...baseItem,
        type: "table",
        headers: content.headers || [],
        rows: content.rows || [],
        caption: content.caption,
        sortable: content.sortable !== false,
      }

    case "link":
      return {
        ...baseItem,
        type: "link",
        url: content.url || content,
        title: content.title || content.url || content,
        description: content.description,
        thumbnail: content.thumbnail,
        domain: content.domain,
      }

    case "list":
      return {
        ...baseItem,
        type: "list",
        items: Array.isArray(content) ? content : content.items || [],
        ordered: content.ordered || false,
        nested: content.nested || false,
      }

    case "error":
      return {
        ...baseItem,
        type: "error",
        message: content.message || content,
        code: content.code,
        details: content.details,
      }

    default:
      return {
        ...baseItem,
        type: "text",
        content: JSON.stringify(content),
        format: "plain",
      }
  }
}
