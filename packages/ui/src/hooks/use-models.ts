"use client"

import { useState, useEffect } from 'react'

interface Model {
  id: string
  name: string
  description: string
  category?: string
  provider?: string
  pricing?: {
    input?: number
    output?: number
  }
}

interface ModelsResponse {
  models: Model[]
  total: number
  page: number
  limit: number
}

interface UseModelsOptions {
  search?: string
  sort?: 'popular' | 'newest' | 'alphabetical'
  category?: string
  limit?: number
  page?: number
}

// Mock data for development
const mockModels: Model[] = [
  {
    id: '1',
    name: 'GPT-4 Turbo',
    description: 'Most capable GPT-4 model and optimized for chat',
    category: 'Language Model',
    provider: 'OpenAI'
  },
  {
    id: '2', 
    name: 'Claude 3 Opus',
    description: 'Anthropic\'s most powerful model for complex tasks',
    category: 'Language Model',
    provider: 'Anthropic'
  },
  {
    id: '3',
    name: 'DALL-E 3',
    description: 'Advanced image generation model',
    category: 'Image Generation',
    provider: 'OpenAI'
  },
  {
    id: '4',
    name: 'Stable Diffusion XL',
    description: 'High-quality image generation with fine control',
    category: 'Image Generation',
    provider: 'Stability AI'
  },
  {
    id: '5',
    name: 'Whisper Large',
    description: 'Advanced speech recognition and transcription',
    category: 'Audio',
    provider: 'OpenAI'
  }
]

export function useModels(options: UseModelsOptions = {}) {
  const [data, setData] = useState<ModelsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModels = async () => {
      if (!options.search && Object.keys(options).length === 1) {
        // Don't fetch if only search is provided but empty
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300))

        let filteredModels = [...mockModels]

        // Apply search filter
        if (options.search) {
          const searchLower = options.search.toLowerCase()
          filteredModels = filteredModels.filter(model =>
            model.name.toLowerCase().includes(searchLower) ||
            model.description.toLowerCase().includes(searchLower) ||
            model.category?.toLowerCase().includes(searchLower)
          )
        }

        // Apply category filter
        if (options.category) {
          filteredModels = filteredModels.filter(model => 
            model.category === options.category
          )
        }

        // Apply sorting
        switch (options.sort) {
          case 'alphabetical':
            filteredModels.sort((a, b) => a.name.localeCompare(b.name))
            break
          case 'newest':
            // For demo, just reverse the order
            filteredModels.reverse()
            break
          case 'popular':
          default:
            // Default order is already "popular"
            break
        }

        // Apply pagination
        const limit = options.limit || 10
        const page = options.page || 1
        const startIndex = (page - 1) * limit
        const paginatedModels = filteredModels.slice(startIndex, startIndex + limit)

        const response: ModelsResponse = {
          models: paginatedModels,
          total: filteredModels.length,
          page,
          limit
        }

        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models')
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [options.search, options.sort, options.category, options.limit, options.page])

  return { data, loading, error }
}
