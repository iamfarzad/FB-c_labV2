// Simple syntax highlighter for common languages
export const highlightCode = (code: string, language: string): string => {
  const keywords: Record<string, string[]> = {
    javascript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "import",
      "export",
      "async",
      "await",
    ],
    typescript: [
      "const",
      "let",
      "var",
      "function",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "import",
      "export",
      "async",
      "await",
      "interface",
      "type",
    ],
    python: [
      "def",
      "class",
      "import",
      "from",
      "return",
      "if",
      "else",
      "elif",
      "for",
      "while",
      "try",
      "except",
      "with",
      "as",
    ],
    html: ["html", "head", "body", "div", "span", "p", "a", "img", "script", "style"],
    css: ["color", "background", "margin", "padding", "border", "width", "height", "display", "position"],
  }

  const langKeywords = keywords[language.toLowerCase()] || []

  let highlighted = code

  // Highlight keywords
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "g")
    highlighted = highlighted.replace(regex, `<span class="syntax-keyword">${keyword}</span>`)
  })

  // Highlight strings
  highlighted = highlighted.replace(/(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span class="syntax-string">$1$2$3</span>')

  // Highlight comments
  if (language === "javascript" || language === "typescript") {
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="syntax-comment">$1</span>')
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="syntax-comment">$1</span>')
  } else if (language === "python") {
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="syntax-comment">$1</span>')
  }

  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')

  return highlighted
}

export const getLanguageIcon = (language: string): string => {
  const icons: Record<string, string> = {
    javascript: "🟨",
    typescript: "🔷",
    python: "🐍",
    html: "🌐",
    css: "🎨",
    json: "📋",
    sql: "🗃️",
    bash: "⚡",
    shell: "⚡",
    markdown: "📝",
    yaml: "⚙️",
    xml: "📄",
    default: "📄",
  }

  return icons[language.toLowerCase()] || icons.default
}
