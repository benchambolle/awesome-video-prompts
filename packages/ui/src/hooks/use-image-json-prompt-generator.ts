import { useState, useCallback } from "react"
import { getFalApiKey } from "@workspace/ui/lib/fal-api-utils"

interface UseImageJsonPromptGeneratorOptions {
  model?: string
  onSuccess?: (jsonPrompt: object) => void
  onError?: (error: string) => void
  onProgress?: (event: any) => void
}

interface FalStreamEvent {
  type: string
  data?: any
}

interface FalStreamResult {
  output: string
}

interface FalStream {
  done: () => Promise<FalStreamResult>
  [Symbol.asyncIterator]: () => AsyncIterator<FalStreamEvent>
}

interface FalClient {
  config: (options: { credentials: string }) => void
  stream: (endpoint: string, options: any) => Promise<FalStream>
}

export function useImageJsonPromptGenerator(options: UseImageJsonPromptGeneratorOptions = {}) {
  const { 
    model = "anthropic/claude-3.7-sonnet",
    onSuccess, 
    onError,
    onProgress
  } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string[]>([])

  const generateJsonFromImage = useCallback(async (
    imageUrl: string, 
    userNotes: string = "",
    fragmentPrompt: string = ""
  ): Promise<object | null> => {
    const apiKey = getFalApiKey()
    
    if (!apiKey) {
      const errorMsg = "Please set your FAL API key first using the key icon in the header."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    if (!imageUrl.trim()) {
      const errorMsg = "Please provide an image URL."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    setIsLoading(true)
    setError(null)
    setProgress([])

    try {
      // Import FAL client dynamically to avoid SSR issues
      const { fal }: { fal: FalClient } = await import("@fal-ai/client")
      
      // Configure FAL with the API key
      fal.config({
        credentials: apiKey
      })

      // Construct the prompt with user notes and fragments
      let promptText = "Generate a JSON video prompt based on this image."
      
      if (userNotes.trim()) {
        promptText += ` User notes: ${userNotes.trim()}`
      }
      
      if (fragmentPrompt.trim()) {
        promptText += ` Fragment selections: ${fragmentPrompt.trim()}`
      }

      const systemPrompt = `You are an expert video-prompt composer. Inputs: one image, optional user notes, and zero or more fragment phrases drawn from JSON category files (e.g. historical_period, style_family, camera_shot, camera_movement, lighting, mood, environment, weather, action_blocking, motion_logic, sound_direction, color_grade, lens, focus_control, composition, frame_rate_motion, time_of_day, transitions_editing, vfx, subject, style, culture_context). Analyse the image first, then user notes, then fragments; resolve conflicts in that order.

Analyze the image thoroughly and create a comprehensive JSON breakdown with rich detail. You MUST include at least 8-15 categories from this list: "subject", "action_blocking", "environment", "setting", "lighting", "camera_shot", "camera_movement", "lens", "focus_control", "composition", "mood", "style", "style_family", "color_grade", "time_of_day", "weather", "motion_logic", "frame_rate_motion", "sound_direction", "transitions_editing", "vfx", "historical_period", "culture_context".

For each category, provide vivid, cinematic descriptions (3-12 words) that capture the essence professionally. Always include core elements like subject, setting, lighting, camera_shot, mood, and style at minimum. Add technical elements like lens, composition, color_grade when relevant. Include atmospheric elements like weather, time_of_day, sound_direction to enrich the scene.

Return a comprehensive, well-populated JSON object with detailed creative content. Output **only** the valid JSON object, with no additional text, comments, or examples.`

      const stream = await fal.stream("fal-ai/any-llm/vision", {
        input: {
          prompt: promptText,
          system_prompt: systemPrompt,
          model,
          image_url: imageUrl
        }
      })

      // Process streaming events
      for await (const event of stream) {
        const progressMsg = `Processing: ${event.type || 'analyzing image'}`
        setProgress(prev => [...prev, progressMsg])
        onProgress?.(event)
      }

      const result = await stream.done()

      if (result?.output) {
        try {
          // Try to parse the JSON response directly
          const jsonOutput = JSON.parse(result.output.trim())
          onSuccess?.(jsonOutput)
          return jsonOutput
        } catch (parseError) {
          // If direct parsing fails, try to extract JSON from the response
          const jsonMatch = result.output.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              const extractedJson = JSON.parse(jsonMatch[0])
              onSuccess?.(extractedJson)
              return extractedJson
            } catch (extractError) {
              throw new Error("Failed to parse JSON response from the vision API")
            }
          } else {
            throw new Error("No valid JSON found in the vision API response")
          }
        }
      } else {
        throw new Error("No JSON prompt generated from the image")
      }

    } catch (err) {
      console.error("Error generating JSON from image:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to generate JSON prompt from image. Please try again."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [model, onSuccess, onError, onProgress])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearProgress = useCallback(() => {
    setProgress([])
  }, [])

  return {
    generateJsonFromImage,
    isLoading,
    error,
    progress,
    clearError,
    clearProgress
  }
}
