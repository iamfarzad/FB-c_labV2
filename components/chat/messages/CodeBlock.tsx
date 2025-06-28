'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, Copy, Terminal, FileText, Code, Type, Braces, FileCode, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Supported languages for syntax highlighting
const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'dart',
  'json',
  'yaml',
  'html',
  'css',
  'scss',
  'sql',
  'bash',
  'markdown',
  'plaintext',
];

// Language aliases
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  cs: 'csharp',
  cpp: 'cpp',
  h: 'c',
  hpp: 'cpp',
  rs: 'rust',
  kt: 'kotlin',
  dart: 'dart',
  yml: 'yaml',
  sh: 'bash',
  zsh: 'bash',
  md: 'markdown',
  txt: 'plaintext',
};

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  dart: 'Dart',
  json: 'JSON',
  yaml: 'YAML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
  bash: 'Bash',
  markdown: 'Markdown',
  plaintext: 'Plain Text',
};

// Language icons
const LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  javascript: <FileCode className="h-3.5 w-3.5" />,
  typescript: <FileCode className="h-3.5 w-3.5 text-blue-600" />,
  jsx: <FileCode className="h-3.5 w-3.5 text-yellow-500" />,
  tsx: <FileCode className="h-3.5 w-3.5 text-blue-600" />,
  python: <FileCode className="h-3.5 w-3.5 text-blue-400" />,
  java: <FileCode className="h-3.5 w-3.5 text-red-500" />,
  c: <FileCode className="h-3.5 w-3.5 text-blue-400" />,
  cpp: <FileCode className="h-3.5 w-3.5 text-blue-400" />,
  csharp: <FileCode className="h-3.5 w-3.5 text-purple-500" />,
  go: <FileCode className="h-3.5 w-3.5 text-blue-500" />,
  rust: <FileCode className="h-3.5 w-3.5 text-orange-500" />,
  php: <FileCode className="h-3.5 w-3.5 text-purple-400" />,
  ruby: <FileCode className="h-3.5 w-3.5 text-red-400" />,
  swift: <FileCode className="h-3.5 w-3.5 text-orange-400" />,
  kotlin: <FileCode className="h-3.5 w-3.5 text-purple-500" />,
  dart: <FileCode className="h-3.5 w-3.5 text-blue-400" />,
  json: <FileJson className="h-3.5 w-3.5 text-yellow-500" />,
  yaml: <FileCode className="h-3.5 w-3.5 text-blue-400" />,
  html: <FileCode className="h-3.5 w-3.5 text-orange-500" />,
  css: <FileCode className="h-3.5 w-3.5 text-blue-500" />,
  scss: <FileCode className="h-3.5 w-3.5 text-pink-500" />,
  sql: <FileCode className="h-3.5 w-3.5 text-blue-400" />,
  bash: <Terminal className="h-3.5 w-3.5 text-gray-500" />,
  markdown: <FileText className="h-3.5 w-3.5 text-blue-400" />,
  plaintext: <Type className="h-3.5 w-3.5 text-gray-500" />,
};

// Default language icon
const DEFAULT_LANGUAGE_ICON = <Code className="h-3.5 w-3.5" />;

interface CodeBlockProps {
  /**
   * The code to display
   */
  children: string;
  /**
   * The language of the code for syntax highlighting
   */
  language?: string;
  /**
   * Whether to show line numbers
   * @default false
   */
  showLineNumbers?: boolean;
  /**
   * Whether to show the language selector
   * @default true
   */
  showLanguageSelector?: boolean;
  /**
   * Whether to show the copy button
   * @default true
   */
  showCopyButton?: boolean;
  /**
   * Custom class name for the container
   */
  className?: string;
  /**
   * Callback when the language changes
   */
  onLanguageChange?: (language: string) => void;
  /**
   * Whether to wrap long lines
   * @default false
   */
  wrapLongLines?: boolean;
  /**
   * Maximum height of the code block before scrolling
   */
  maxHeight?: string | number;
  /**
   * Whether to show the filename
   */
  filename?: string;
}

/**
 * Normalizes the language name to a supported language
 */
const normalizeLanguage = (language?: string): string => {
  if (!language) return 'plaintext';
  
  const lang = language.toLowerCase().trim();
  
  // Check if it's a supported language
  if (SUPPORTED_LANGUAGES.includes(lang)) {
    return lang;
  }
  
  // Check if it's an alias
  if (LANGUAGE_ALIASES[lang]) {
    return LANGUAGE_ALIASES[lang];
  }
  
  // Default to plaintext
  return 'plaintext';
};

/**
 * Gets the display name for a language
 */
const getLanguageName = (language: string): string => {
  return LANGUAGE_NAMES[language] || language;
};

/**
 * Gets the icon for a language
 */
const getLanguageIcon = (language: string): React.ReactNode => {
  return LANGUAGE_ICONS[language] || DEFAULT_LANGUAGE_ICON;
};

/**
 * Applies syntax highlighting to the code
 * In a real app, you would use a library like Prism.js or highlight.js
 */
const highlightCode = (code: string, language: string): string => {
  // This is a simplified version - in a real app, you would use a proper syntax highlighter
  // For now, we'll just return the code as-is
  return code;
};

export const CodeBlock = ({
  children,
  language: initialLanguage = 'plaintext',
  showLineNumbers = false,
  showLanguageSelector = true,
  showCopyButton = true,
  className,
  onLanguageChange,
  wrapLongLines = false,
  maxHeight = 'auto',
  filename,
}: CodeBlockProps) => {
  const [language, setLanguage] = useState(normalizeLanguage(initialLanguage));
  const [isCopied, setIsCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  
  const highlightedCode = highlightCode(children, language);
  const lineCount = children.split('\n').length;
  
  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    const normalizedLang = normalizeLanguage(newLanguage);
    setLanguage(normalizedLang);
    onLanguageChange?.(normalizedLang);
  };
  
  // Copy code to clipboard
  const copyToClipboard = () => {
    if (!children) return;
    
    navigator.clipboard.writeText(children).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };
  
  // Apply syntax highlighting when language changes
  useEffect(() => {
    // In a real app, you would initialize your syntax highlighter here
    // For example: Prism.highlightAllUnder(containerRef.current);
    
    // This is a simplified version that just updates the class
    if (codeRef.current) {
      // Remove all language classes
      codeRef.current.className = '';
      // Add the language class
      codeRef.current.classList.add(`language-${language}`);
    }
  }, [language, children]);
  
  return (
    <div className={cn('relative rounded-md bg-muted/50 border overflow-hidden', className)}>
      {/* Header with filename and actions */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/50 text-xs">
        <div className="flex items-center gap-2">
          {filename ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileCode className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate max-w-[200px] font-medium">{filename}</span>
            </div>
          ) : showLanguageSelector ? (
            <div className="flex items-center gap-1.5">
              {getLanguageIcon(language)}
              <Select
                value={language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="h-6 w-auto gap-1.5 border-none bg-transparent p-0 text-xs font-medium text-foreground hover:bg-accent [&>span]:truncate">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] w-[200px]">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0">
                          {getLanguageIcon(lang)}
                        </span>
                        <span>{getLanguageName(lang)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {getLanguageIcon(language)}
              <span className="font-medium">{getLanguageName(language)}</span>
            </div>
          )}
        </div>
        
        {showCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
      
      {/* Code content */}
      <div className="relative">
        <ScrollArea 
          className="w-full overflow-auto" 
          style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
        >
          <pre 
            ref={preRef}
            className={cn(
              'relative flex overflow-x-auto p-4 text-sm',
              wrapLongLines ? 'whitespace-pre-wrap' : 'whitespace-pre',
              showLineNumbers && 'pl-12' // Add padding for line numbers
            )}
            style={{ tabSize: 2 }}
          >
            {showLineNumbers && (
              <div 
                className="select-none border-r pr-3 text-right text-xs text-muted-foreground"
                style={{ 
                  width: `${String(lineCount).length}ch`,
                  fontFamily: 'monospace',
                }}
                aria-hidden="true"
              >
                {Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')}
              </div>
            )}
            <code 
              ref={codeRef}
              className={cn(
                'flex-1 overflow-x-auto pl-4',
                `language-${language}`
              )}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CodeBlock;
