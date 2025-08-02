import { useState, useCallback } from "react"
import { getFalApiKey } from "@workspace/ui/lib/fal-api-utils"

interface UsePromptEnhancerOptions {
  model?: string
  onSuccess?: (enhancedPrompt: string) => void
  onError?: (error: string) => void
}

interface FalResponse {
  data: {
    output: string
  }
  requestId: string
}

interface FalQueueUpdate {
  status: string
  logs?: Array<{ message: string }>
}

interface FalClient {
  config: (options: { credentials: string }) => void
  subscribe: (endpoint: string, options: any) => Promise<FalResponse>
}

export function usePromptEnhancer(options: UsePromptEnhancerOptions = {}) {
  const { model = "openai/gpt-4o", onSuccess, onError } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const enhancePrompt = useCallback(async (originalPrompt: string): Promise<string | null> => {
    const apiKey = getFalApiKey()
    
    if (!apiKey) {
      const errorMsg = "Please set your FAL API key first using the key icon in the header."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    if (!originalPrompt.trim()) {
      const errorMsg = "Please provide a prompt to enhance."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    setIsLoading(true)
    setError(null)
    setLogs([])

    try {
      // Import FAL client dynamically to avoid SSR issues
      const { fal }: { fal: FalClient } = await import("@fal-ai/client")
      
      // Configure FAL with the API key
      fal.config({
        credentials: apiKey
      })

      const enhancementPrompt = `You are an expert video-prompt composer. Inputs: free-form user notes plus any number of fragment phrases drawn from JSON categories such as historical_period, style_family, camera_shot, camera_movement, lighting, mood, environment, weather, action_blocking, motion_logic, sound_direction, color_grade, lens, focus_control, composition, frame_rate_motion, time_of_day, transitions_editing, vfx, subject, style, culture_context, and others. Produce one cohesive English paragraph, 65–110 words inclusive, primarily comma-separated, no line breaks, bullets, labels, markdown, or meta commentary. Ground every decision in explicit user notes first, then fragment phrases; when fragments clash, choose the most coherent combination. Translate all fragments into vivid, precise sensory and kinetic cues—setting, subjects, materials, light, color, camera feel, movement, ambient sound, forward beat or transition—without naming categories or quoting phrases verbatim. Match tone and medium implied by the fragments, whether live-action, everyday handheld, stylised animation, or experimental abstract. Prefer strong nouns and verbs over vague adjectives; avoid proper nouns unless explicitly provided. Output nothing except the paragraph.

User Input:
${originalPrompt}

Please generate the enhanced cinematic video prompt following the above guidelines.`

      const result = await fal.subscribe("fal-ai/any-llm", {
        input: {
          prompt: enhancementPrompt,
          model,
          reasoning: false
        },
        logs: true,
        onQueueUpdate: (update: FalQueueUpdate) => {
          if (update.status === "IN_PROGRESS") {
            const newLogs = update.logs?.map((log: { message: string }) => log.message) || []
            setLogs(prev => [...prev, ...newLogs])
          }
        },
      }) as FalResponse

      if (result.data?.output) {
        const enhancedPrompt = result.data.output.trim()
        onSuccess?.(enhancedPrompt)
        return enhancedPrompt
      } else {
        throw new Error("No enhanced prompt received from the API")
      }

    } catch (err) {
      console.error("Error enhancing prompt:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to enhance prompt. Please try again."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [model, onSuccess, onError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    enhancePrompt,
    isLoading,
    error,
    logs,
    clearError,
    clearLogs
  }
}
