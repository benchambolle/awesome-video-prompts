import { useState, useCallback } from "react"
import { getFalApiKey } from "@workspace/ui/lib/fal-api-utils"

interface UseImagePromptGeneratorOptions {
  model?: string
  systemPrompt?: string
  onSuccess?: (generatedPrompt: string) => void
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

export function useImagePromptGenerator(options: UseImagePromptGeneratorOptions = {}) {
  const { 
    model = "anthropic/claude-3.7-sonnet",
    systemPrompt = "You are an expert video-prompt composer. Inputs: one image, any user notes, plus zero or more fragment phrases drawn from JSON categories such as historical_period, style_family, camera_shot, camera_movement, lighting, mood, environment, action_blocking, sound_direction, time_of_day, weather, and others. Output one cohesive English paragraph, 65–110 words inclusive, primarily comma-separated, no line breaks, bullets, labels, markdown, or meta commentary. Fuse every fragment with concrete sensory details and motion logic, adjusting tense, syntax, and vocabulary to match the implied visual style—live-action, everyday, cartoon, experimental, or otherwise. Ground all choices in the image first, then user notes, then fragments. Do not name categories; translate them into vivid but precise cues about setting, subjects, materials, light, color, camera feel, movement, ambient sound, and a forward beat or transition. Prefer strong nouns and verbs over generic adjectives; avoid proper nouns unless visible. Produce nothing except the paragraph.",
    onSuccess, 
    onError,
    onProgress
  } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string[]>([])

  // Helper function to upload file to FAL storage
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const apiKey = getFalApiKey()
    
    if (!apiKey) {
      throw new Error("FAL API key is required for file uploads")
    }

    try {
      // Import FAL client dynamically
      const { fal } = await import("@fal-ai/client")
      
      // Configure FAL with the API key
      fal.config({
        credentials: apiKey
      })

      // Upload file and get URL - using any type to bypass interface issue
      const url = await (fal as any).storage.upload(file)
      console.log('✅ File uploaded successfully:', url)
      return url
    } catch (err) {
      console.error('❌ File upload failed:', err)
      throw new Error(`Failed to upload file: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [])

  const generatePromptFromImage = useCallback(async (
    imageSource: string | File, 
    prompt: string = "Caption this image for a text-to-image model with as much detail as possible."
  ): Promise<string | null> => {
    const apiKey = getFalApiKey()
    
    if (!apiKey) {
      const errorMsg = "Please set your FAL API key first using the key icon in the header."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    // Handle both File and string inputs
    let imageUrl: string
    
    if (imageSource instanceof File) {
      console.log('📁 File detected, uploading to FAL storage...')
      setProgress(prev => [...prev, 'Uploading image...'])
      
      try {
        imageUrl = await uploadFile(imageSource)
        setProgress(prev => [...prev, 'Image uploaded successfully'])
      } catch (uploadError) {
        const errorMsg = `Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`
        setError(errorMsg)
        onError?.(errorMsg)
        return null
      }
    } else {
      imageUrl = imageSource
      
      if (!imageUrl.trim()) {
        const errorMsg = "Please provide an image URL or file."
        setError(errorMsg)
        onError?.(errorMsg)
        return null
      }
    }

    setIsLoading(true)
    setError(null)
    if (!(imageSource instanceof File)) {
      setProgress([])
    }

    try {
      // Import FAL client dynamically to avoid SSR issues
      const { fal }: { fal: FalClient } = await import("@fal-ai/client")
      
      // Configure FAL with the API key
      fal.config({
        credentials: apiKey
      })

      setProgress(prev => [...prev, 'Generating prompt from image...'])
      
      const stream = await fal.stream("fal-ai/any-llm/vision", {
        input: {
          prompt,
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
        const generatedPrompt = result.output.trim()
        onSuccess?.(generatedPrompt)
        return generatedPrompt
      } else {
        throw new Error("No prompt generated from the image")
      }

    } catch (err) {
      console.error("Error generating prompt from image:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to generate prompt from image. Please try again."
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [model, systemPrompt, onSuccess, onError, onProgress])

  const generateDetailedPrompt = useCallback(async (imageSource: string | File, customPrompt?: string, context?: any): Promise<string | null> => {
    const defaultPrompt = "Describe this image in extreme detail for use as a text-to-image generation prompt. Include: visual elements, composition, lighting, colors, mood, style, camera angle, and any artistic techniques. Make it comprehensive and specific.";
    const finalPrompt = customPrompt || defaultPrompt;
    return generatePromptFromImage(imageSource, finalPrompt);
  }, [generatePromptFromImage])

  const generateVideoPrompt = useCallback(async (imageSource: string | File, customPrompt?: string): Promise<string | null> => {
    const defaultPrompt = "Describe this image as a starting point for video generation. Include: the scene, potential movements, camera work, transitions, mood, and how this could evolve into a dynamic video sequence. Focus on motion and cinematography.";
    const finalPrompt = customPrompt || defaultPrompt;
    return generatePromptFromImage(imageSource, finalPrompt);
  }, [generatePromptFromImage])

  const generateStylePrompt = useCallback(async (imageSource: string | File): Promise<string | null> => {
    return generatePromptFromImage(
      imageSource,
      "Analyze the artistic style, technique, and aesthetic qualities of this image. Describe the visual style, color palette, lighting technique, composition rules, and artistic approach that could be replicated in AI generation."
    )
  }, [generatePromptFromImage])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearProgress = useCallback(() => {
    setProgress([])
  }, [])

  return {
    generatePromptFromImage,
    generateDetailedPrompt,
    generateVideoPrompt,
    generateStylePrompt,
    isLoading,
    error,
    progress,
    clearError,
    clearProgress
  }
}
