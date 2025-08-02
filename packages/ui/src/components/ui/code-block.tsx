"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./button.js"
import { Badge } from "./badge.js"
import { 
  Copy, 
  Check, 
  Download, 
  Play, 
  Terminal,
  FileText,
  Maximize2,
  Minimize2
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

// Prism.js highlighting function (we'll implement this manually for better control)
const highlightCode = (code: string, language: string): string => {
  // Simple syntax highlighting patterns
  const patterns: Record<string, Array<[RegExp, string]>> = {
    javascript: [
      [/\b(const|let|var|function|class|import|export|from|return|if|else|for|while|try|catch|async|await)\b/g, 'keyword'],
      [/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g, 'string'],
      [/\/\/.*$/gm, 'comment'],
      [/\/\*[\s\S]*?\*\//g, 'comment'],
      [/\b\d+(\.\d+)?\b/g, 'number'],
      [/\b(true|false|null|undefined)\b/g, 'boolean'],
    ],
    python: [
      [/\b(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|pass|break|continue|async|await)\b/g, 'keyword'],
      [/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|'''[\s\S]*?'''|"""[\s\S]*?"""/g, 'string'],
      [/#.*$/gm, 'comment'],
      [/\b\d+(\.\d+)?\b/g, 'number'],
      [/\b(True|False|None)\b/g, 'boolean'],
    ],
    bash: [
      [/\b(echo|cd|ls|mkdir|rm|cp|mv|chmod|chown|grep|find|sed|awk|cat|less|more|head|tail|curl|wget)\b/g, 'keyword'],
      [/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g, 'string'],
      [/#.*$/gm, 'comment'],
      [/\$[\w_]+|\$\{[^}]+\}/g, 'variable'],
      [/--?\w+/g, 'flag'],
    ],
    json: [
      [/"([^"\\]|\\.)*"(?=\s*:)/g, 'property'],
      [/"([^"\\]|\\.)*"(?!\s*:)/g, 'string'],
      [/\b\d+(\.\d+)?\b/g, 'number'],
      [/\b(true|false|null)\b/g, 'boolean'],
    ],
    css: [
      [/[.#]?[\w-]+(?=\s*\{)/g, 'selector'],
      [/[\w-]+(?=\s*:)/g, 'property'],
      [/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g, 'string'],
      [/\/\*[\s\S]*?\*\//g, 'comment'],
      [/#[\da-fA-F]{3,6}\b/g, 'color'],
    ],
    html: [
      [/<\/?[\w\s="/.':;#-\/\?]+>/g, 'tag'],
      [/<!--[\s\S]*?-->/g, 'comment'],
    ],
    sql: [
      [/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|INDEX|TABLE|DATABASE|JOIN|INNER|LEFT|RIGHT|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET)\b/gi, 'keyword'],
      [/'([^'\\]|\\.)*'/g, 'string'],
      [/--.*$/gm, 'comment'],
      [/\/\*[\s\S]*?\*\//g, 'comment'],
    ]
  }

  let highlighted = code
  const languagePatterns = patterns[language] || []

  // Apply highlighting patterns
  languagePatterns.forEach(([pattern, className]) => {
    highlighted = highlighted.replace(pattern, `<span class="${className}">$&</span>`)
  })

  return highlighted
}

interface CodeBlockProps {
  children: string
  language?: string
  title?: string
  filename?: string
  showLineNumbers?: boolean
  highlightLines?: number[]
  maxHeight?: string
  allowCopy?: boolean
  allowDownload?: boolean
  allowRun?: boolean
  onRun?: () => void
  className?: string
}

export function CodeBlock({
  children,
  language = "text",
  title,
  filename,
  showLineNumbers = false,
  highlightLines = [],
  maxHeight,
  allowCopy = true,
  allowDownload = false,
  allowRun = false,
  onRun,
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([children], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `code.${language}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLanguageIcon = (lang: string) => {
    const icons: Record<string, string> = {
      javascript: "🟨",
      typescript: "🔷",
      python: "🐍",
      bash: "⚡",
      json: "📄",
      html: "🌐",
      css: "🎨",
      sql: "🗃️",
      yaml: "📋",
      markdown: "📝"
    }
    return icons[lang] || "📄"
  }

  const formatLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      bash: "Bash",
      json: "JSON",
      html: "HTML",
      css: "CSS",
      sql: "SQL",
      yaml: "YAML",
      markdown: "Markdown"
    }
    return names[lang] || lang.toUpperCase()
  }

  const lines = children.split('\n')
  const highlightedCode = highlightCode(children, language)

  return (
    <div className={cn("group relative", className)}>
      {/* Header */}
      {(title || filename || language !== "text") && (
        <div className="flex items-center justify-between bg-muted border border-b-0 rounded-t-lg px-4 py-2">
          <div className="flex items-center gap-3">
            {filename && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{filename}</span>
              </div>
            )}
            {title && !filename && (
              <span className="text-sm font-medium">{title}</span>
            )}
            {language !== "text" && (
              <Badge variant="secondary" className="text-xs">
                <span className="mr-1">{getLanguageIcon(language)}</span>
                {formatLanguageName(language)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {allowRun && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRun}
                className="h-8 w-8 p-0"
                title="Run code"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            {allowDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadCode}
                className="h-8 w-8 p-0"
                title="Download code"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            {maxHeight && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
            {allowCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 w-8 p-0"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Code Container */}
      <div 
        className={cn(
          "relative overflow-hidden border rounded-md",
          (title || filename || language !== "text") && "rounded-t-none border-t-0"
        )}
      >
        <div 
          className={cn(
            "overflow-auto",
            maxHeight && !isExpanded && "max-h-80",
            "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
          )}
          style={{ maxHeight: maxHeight && !isExpanded ? maxHeight : undefined }}
        >
          <pre className="relative p-4 text-sm leading-relaxed">
            {showLineNumbers && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r border-border flex flex-col text-xs text-muted-foreground">
                {lines.map((_, index) => (
                  <div
                    key={index + 1}
                    className={cn(
                      "px-2 py-0.5 text-right select-none",
                      highlightLines.includes(index + 1) && "bg-primary/10"
                    )}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
            <code
              ref={codeRef}
              className={cn(
                "block font-mono",
                showLineNumbers && "ml-12"
              )}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>

        {/* Fade overlay when collapsed */}
        {maxHeight && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}

        {/* Copy button (always visible on mobile) */}
        {allowCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className={cn(
              "absolute top-2 right-2 h-8 w-8 p-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity",
              copied && "text-green-500"
            )}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {/* Terminal-style indicator */}
      {language === "bash" && (
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

// CSS for syntax highlighting (inject into global styles)
export const codeHighlightStyles = `
.keyword { color: hsl(var(--primary)); font-weight: 600; }
.string { color: hsl(142 76% 36%); }
.comment { color: hsl(var(--muted-foreground)); font-style: italic; }
.number { color: hsl(262 83% 58%); }
.boolean { color: hsl(262 83% 58%); }
.property { color: hsl(221 83% 53%); }
.selector { color: hsl(var(--primary)); }
.color { color: hsl(142 76% 36%); }
.tag { color: hsl(221 83% 53%); }
.variable { color: hsl(38 92% 50%); }
.flag { color: hsl(262 83% 58%); }
`