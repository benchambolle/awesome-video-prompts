import { useState, useCallback } from "react"
import { getFalApiKey } from "@workspace/ui/lib/fal-api-utils"

interface UseJsonPromptGeneratorOptions {
  model?: string
  onSuccess?: (jsonPrompt: object) => void
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

export function useJsonPromptGenerator(options: UseJsonPromptGeneratorOptions = {}) {
  const { model = "openai/gpt-4o", onSuccess, onError } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const generateJsonPrompt = useCallback(async (originalPrompt: string): Promise<object | null> => {
    const apiKey = getFalApiKey()
    
    if (!apiKey) {
      const errorMsg = "Please set your FAL API key first using the key icon in the header."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    if (!originalPrompt.trim()) {
      const errorMsg = "Please provide a prompt to generate JSON from."
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

      const jsonPrompt = `You are an expert video-prompt composer. Inputs: free-form user notes plus zero or more fragment phrases drawn from JSON category files (historical_period, style_family, camera_shot, camera_movement, lighting, mood, environment, weather, action_blocking, motion_logic, sound_direction, color_grade, lens, focus_control, composition, frame_rate_motion, time_of_day, transitions_editing, vfx, subject, style, culture_context, and others). Prioritise user notes over fragments when combining details; if fragments conflict, choose the most coherent blend. 

Analyze the input thoroughly and create a comprehensive JSON breakdown with rich detail. You MUST include at least 8-15 categories from this list: "subject", "action_blocking", "environment", "setting", "lighting", "camera_shot", "camera_movement", "lens", "focus_control", "composition", "mood", "style", "style_family", "color_grade", "time_of_day", "weather", "motion_logic", "frame_rate_motion", "sound_direction", "transitions_editing", "vfx", "historical_period", "culture_context".

For each category, provide vivid, cinematic descriptions (3-12 words) that capture the essence professionally. Always include core elements like subject, setting, lighting, camera_shot, mood, and style at minimum. Add technical elements like lens, composition, color_grade when relevant. Include atmospheric elements like weather, time_of_day, sound_direction to enrich the scene.

Return a comprehensive, well-populated JSON object with detailed creative content. Output **only** the valid JSON object—no extra text, comments, or examples.

User Input:
${originalPrompt}`

      const result = await fal.subscribe("fal-ai/any-llm", {
        input: {
          prompt: jsonPrompt,
          model,
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
        try {
          // Try to parse the JSON response
          const jsonOutput = JSON.parse(result.data.output.trim())
          onSuccess?.(jsonOutput)
          return jsonOutput
        } catch (parseError) {
          // If JSON parsing fails, try to extract JSON from the response
          const jsonMatch = result.data.output.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              const extractedJson = JSON.parse(jsonMatch[0])
              onSuccess?.(extractedJson)
              return extractedJson
            } catch (extractError) {
              throw new Error("Failed to parse JSON response from the API")
            }
          } else {
            throw new Error("No valid JSON found in the API response")
          }
        }
      } else {
        throw new Error("No JSON prompt received from the API")
      }

    } catch (err) {
      console.error("Error generating JSON prompt:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to generate JSON prompt. Please try again."
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
    generateJsonPrompt,
    isLoading,
    error,
    logs,
    clearError,
    clearLogs
  }
}
