"use client"

import { useState } from "react"
import { Button } from "@workspace/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/ui/dialog"
import { Textarea } from "@workspace/ui/components/ui/textarea"
import { Label } from "@workspace/ui/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon, Copy01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert"
import { Badge } from "@workspace/ui/components/ui/badge"
import { getFalApiKey } from "@workspace/ui/lib/fal-api-utils"

interface PromptEnhancerProps {
  children?: React.ReactNode
  initialPrompt?: string
  onPromptEnhanced?: (enhancedPrompt: string) => void
}

interface FalResponse {
  data: {
    output: string
  }
  requestId: string
}

export function PromptEnhancer({ children, initialPrompt = "", onPromptEnhanced }: PromptEnhancerProps) {
  const [open, setOpen] = useState(false)
  const [originalPrompt, setOriginalPrompt] = useState(initialPrompt)
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const enhancePrompt = async () => {
    const apiKey = getFalApiKey()
    
    if (!apiKey) {
      setError("Please set your FAL API key first using the key icon in the header.")
      return
    }

    if (!originalPrompt.trim()) {
      setError("Please enter a prompt to enhance.")
      return
    }

    setIsLoading(true)
    setError(null)
    setLogs([])
    setEnhancedPrompt("")

    try {
      // Import FAL client dynamically to avoid SSR issues
      const { fal } = await import("@fal-ai/client")
      
      // Configure FAL with the API key
      fal.config({
        credentials: apiKey
      })

      const enhancementPrompt = `You are an expert prompt engineer specializing in video generation prompts. Your task is to enhance and improve the following prompt for better video generation results.

Guidelines for enhancement:
1. Add specific visual details and cinematography terms
2. Include camera movements, lighting, and composition details
3. Specify mood, atmosphere, and style
4. Add technical parameters like aspect ratio, duration hints
5. Make it more descriptive and vivid
6. Keep the core concept intact while making it more professional
7. Ensure the prompt is optimized for AI video generation models

Original prompt: "${originalPrompt}"

Please provide an enhanced version that will produce better video generation results. Return only the enhanced prompt without explanations.`

      const result = await fal.subscribe("fal-ai/any-llm", {
        input: {
          prompt: enhancementPrompt,
          model: "openai/gpt-4o",
          reasoning: false
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            const newLogs = update.logs?.map((log) => log.message) || []
            setLogs(prev => [...prev, ...newLogs])
          }
        },
      }) as FalResponse

      if (result.data?.output) {
        setEnhancedPrompt(result.data.output.trim())
      } else {
        throw new Error("No enhanced prompt received from the API")
      }

    } catch (err) {
      console.error("Error enhancing prompt:", err)
      setError(err instanceof Error ? err.message : "Failed to enhance prompt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const useEnhancedPrompt = () => {
    if (enhancedPrompt && onPromptEnhanced) {
      onPromptEnhanced(enhancedPrompt)
    }
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && initialPrompt !== originalPrompt) {
      setOriginalPrompt(initialPrompt)
      setEnhancedPrompt("")
      setError(null)
      setLogs([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
            Enhance Prompt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} className="h-5 w-5" />
            AI Prompt Enhancer
          </DialogTitle>
          <DialogDescription>
            Use AI to improve your prompt for better video generation results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original Prompt */}
          <div className="space-y-2">
            <Label htmlFor="original-prompt" className="text-sm font-medium">
              Original Prompt
            </Label>
            <Textarea
              id="original-prompt"
              placeholder="Enter your prompt to enhance..."
              value={originalPrompt}
              onChange={(e) => setOriginalPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Enhancement Button */}
          <div className="flex justify-center">
            <Button 
              onClick={enhancePrompt}
              disabled={isLoading || !originalPrompt.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Enhancing...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
                  Enhance Prompt
                </>
              )}
            </Button>
          </div>

          {/* Processing Logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Processing</Label>
              <div className="bg-muted rounded-md p-3 max-h-[100px] overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Prompt */}
          {enhancedPrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Enhanced Prompt</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(enhancedPrompt)}
                    className="h-8 px-2 gap-1"
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  value={enhancedPrompt}
                  readOnly
                  className="min-h-[120px] resize-none bg-muted/50"
                />
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 text-xs"
                >
                  Enhanced
                </Badge>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {enhancedPrompt && onPromptEnhanced && (
            <Button onClick={useEnhancedPrompt} className="gap-2">
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
              Use Enhanced Prompt
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
