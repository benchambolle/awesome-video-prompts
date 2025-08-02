// Client-side data loader for static JSON files
import type { PromptSource } from '../types/source';

// Build-based permanent cache for client-side data
// Since data never changes between builds, we can cache permanently
interface BuildCacheEntry<T> {
  data: T;
  buildVersion: string;
}

class BuildBasedCache {
  private cache = new Map<string, BuildCacheEntry<any>>();
  private readonly BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION || '0.5.7';

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Only invalidate cache if build version changes
    if (entry.buildVersion !== this.BUILD_VERSION) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      buildVersion: this.BUILD_VERSION
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics for debugging
  getStats() {
    return {
      size: this.cache.size,
      buildVersion: this.BUILD_VERSION,
      keys: Array.from(this.cache.keys())
    };
  }
}

const cache = new BuildBasedCache();

// Type definitions
export interface CustomPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  source: PromptSource;
  modelName: string;
  status: 'featured' | 'active' | 'draft' | 'archived';
  featured?: boolean;
  thumbnailUrl?: string;
  video?: string;
  generationType?: 'text_to_video' | 'image_to_video';
  searchTerms?: string[];
}

export interface CustomPromptsData {
  prompts: CustomPrompt[];
  metadata: {
    totalCount: number;
    categories: string[];
    models: string[];
    creators: string[];
    promptsByCategory: Record<string, string[]>;
    promptsBySource: Record<string, string[]>;
    promptsByModel: Record<string, string[]>;
    searchIndex: string[];
  };
}

export interface CustomPromptsResponse {
  prompts: CustomPrompt[];
  totalCount: number;
  categories: string[];
  models: string[];
  creators: string[];
}

// Client-side data fetcher
async function fetchJsonData<T>(path: string): Promise<T> {
  const cacheKey = path;
  
  // Check cache first
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch data from ${path}:`, error);
    throw error;
  }
}

// Client-side filtering functions
function filterPrompts(
  prompts: CustomPrompt[], 
  filters: {
    category?: string;
    source?: string;
    model?: string;
    search?: string;
    featured?: boolean;
    generationType?: string;
  }
): CustomPrompt[] {
  let filtered = [...prompts];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(prompt => 
      prompt.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.source) {
    filtered = filtered.filter(prompt => {
      const sourceName = typeof prompt.source === 'string' 
        ? prompt.source 
        : prompt.source.name || prompt.source.type;
      return sourceName?.toLowerCase().includes(filters.source!.toLowerCase());
    });
  }

  if (filters.model) {
    filtered = filtered.filter(prompt => 
      prompt.modelName.toLowerCase().includes(filters.model!.toLowerCase())
    );
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(prompt => 
      prompt.title.toLowerCase().includes(searchTerm) ||
      prompt.description.toLowerCase().includes(searchTerm) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      prompt.searchTerms?.some(term => term.toLowerCase().includes(searchTerm))
    );
  }

  if (filters.featured !== undefined) {
    filtered = filtered.filter(prompt => 
      filters.featured ? prompt.featured || prompt.status === 'featured' : true
    );
  }

  if (filters.generationType) {
    filtered = filtered.filter(prompt => 
      prompt.generationType === filters.generationType
    );
  }

  return filtered;
}

// Main client data API
export const clientDataApi = {
  // Get custom prompts with client-side filtering
  async getCustomPrompts(filters?: {
    category?: string;
    source?: string;
    model?: string;
    search?: string;
    featured?: boolean;
    generationType?: string;
    limit?: number;
    offset?: number;
  }): Promise<CustomPromptsResponse> {
    const data = await fetchJsonData<CustomPromptsData>('/data/custom-prompts.json');
    
    // Apply filters
    const filteredPrompts = filterPrompts(data.prompts, filters || {});
    
    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginatedPrompts = filteredPrompts.slice(offset, offset + limit);
    
    return {
      prompts: paginatedPrompts,
      totalCount: filteredPrompts.length,
      categories: data.metadata.categories,
      models: data.metadata.models,
      creators: data.metadata.creators
    };
  },

  // Get all categories
  async getCategories() {
    const data = await fetchJsonData<CustomPromptsData>('/data/custom-prompts.json');
    return data.metadata.categories;
  },

  // Get all models
  async getModels() {
    const data = await fetchJsonData<CustomPromptsData>('/data/custom-prompts.json');
    return data.metadata.models;
  },

  // Get all creators
  async getCreators() {
    const data = await fetchJsonData<CustomPromptsData>('/data/custom-prompts.json');
    return data.metadata.creators;
  },

  // Search prompts
  async searchPrompts(query: string, limit = 20): Promise<CustomPrompt[]> {
    const response = await this.getCustomPrompts({ search: query, limit });
    return response.prompts;
  },

  // Get featured prompts
  async getFeaturedPrompts(limit = 10): Promise<CustomPrompt[]> {
    const response = await this.getCustomPrompts({ featured: true, limit });
    return response.prompts;
  },

  // Get prompts by category
  async getPromptsByCategory(category: string): Promise<CustomPrompt[]> {
    const response = await this.getCustomPrompts({ category });
    return response.prompts;
  },

  // Get single prompt by ID
  async getPromptById(id: string): Promise<CustomPrompt | null> {
    const data = await fetchJsonData<CustomPromptsData>('/data/custom-prompts.json');
    return data.prompts.find(prompt => prompt.id === id) || null;
  },

  // Get all models from models.json
  async getVideoModels(): Promise<any[]> {
    const data = await fetchJsonData<{models: any[]}>('/data/models.json');
    
    // Load detailed model configurations
    const modelPromises = data.models.map(async (model) => {
      try {
        // Convert model_id to filename (e.g., "fal-ai/kling-video/v1.6/pro/text-to-video" -> "fal-ai-kling-video-pro-text-to-video.json")
        const filename = this.modelIdToFilename(model.model_id);
        const response = await fetchJsonData<any>(`/data/models/${filename}`);
        
        return {
          ...response,
          type: model.category,
          id: model.model_id,
          display_name: model.display_name,
          description: model.description,
          status: model.status,
          provider: model.provider
        };
      } catch (error) {
        console.warn(`Failed to load detailed config for ${model.model_id}:`, error);
        // Return basic model info if detailed config fails
        return {
          ...model,
          type: model.category,
          id: model.model_id
        };
      }
    });
    
    return await Promise.all(modelPromises);
  },

  // Helper function to convert model ID to filename
  modelIdToFilename(modelId: string): string {
    // Convert model IDs to their corresponding filenames
    const idToFileMap: Record<string, string> = {
      'fal-ai/kling-video/v1.6/pro/text-to-video': 'fal-ai-kling-video-pro-text-to-video.json',
      'fal-ai/ltx-video/13b-098': 'fal-ai-ltx-video-13b.json',
      'fal-ai/minimax/hailuo-02/pro/text-to-video': 'fal-ai-minimax-hailuo-02-pro.json',
      'fal-ai/pixverse/v4.5/text-to-video': 'fal-ai-pixverse-v45-text-to-video.json',
      'fal-ai/bytedance/seedance-v1/pro': 'fal-ai-seedance-v1-pro.json',
      'fal-ai/veo/3/fast': 'fal-ai-veo-3-fast.json',
      'fal-ai/vidu/q1': 'fal-ai-vidu-q1.json',
      'fal-ai/wan/turbo/image-to-video': 'fal-ai-wan-turbo-image-to-video.json',
      'fal-ai/wan/turbo/text-to-video': 'fal-ai-wan-turbo-text-to-video.json',
      'fal-ai/wan/v2.2-5b/text-to-video': 'fal-ai-wan-v22-5b.json'
    };
    
    return idToFileMap[modelId] || `${modelId.replace(/\//g, '-').replace(/\./g, '-')}.json`;
  },

  // Cache management
  cache: {
    clear: () => cache.clear(),
    getStats: () => cache.getStats(),
  }
};

// Export for backward compatibility
export { clientDataApi as dataApi };
