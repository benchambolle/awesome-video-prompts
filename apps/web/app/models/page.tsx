'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect, Suspense } from 'react'
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  VideoReplayIcon, 
  Search01Icon, 
  Cancel01Icon,
  SparklesIcon,
  ClockIcon,
  StarIcon,
  FilterIcon,
  BrainIcon,
  ArrowDown01Icon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  UserIcon,
  DatabaseIcon
} from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/ui/button"
import { Input } from "@workspace/ui/components/ui/input"
import { Badge } from "@workspace/ui/components/ui/badge"
import { StatusBadge } from "@workspace/ui/components/ui/status-badge"
import { Card, CardContent } from "@workspace/ui/components/ui/card"
import { DashboardSubheader, getSubheaderVariant } from "@workspace/ui/components/dashboard-subheader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/ui/dropdown-menu"
import { ModelsGridSkeleton, PageHeaderSkeleton, FiltersSkeleton, PaginationSkeleton } from "@workspace/ui/components/skeletons"

// Import the data API
import { clientDataApi } from '../../lib/client-data-loader'

// Load model data automatically from models.json
const loadModelData = async () => {
  try {
    return await clientDataApi.getVideoModels()
  } catch (error) {
    console.error('Error loading model data:', error)
    return []
  }
}

function ModelsPageContent() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const variant = getSubheaderVariant(pathname)
  
  // State for models
  const [videoModels, setVideoModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCreator, setSelectedCreator] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  
  const ITEMS_PER_PAGE = 12

  // Initialize state from URL parameters
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'
    const creator = searchParams.get('creator') || ''
    const provider = searchParams.get('provider') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const page = parseInt(searchParams.get('page') || '1', 10)
    
    setSearchQuery(search)
    setSelectedType(type)
    setSelectedCategory(category)
    setSelectedCreator(creator)
    setSelectedProvider(provider)
    setSelectedTags(tags)
    setCurrentPage(page)
  }, [searchParams])

  // Update URL when filters change
  const updateURL = useCallback((params: Record<string, string | number | string[]>) => {
    const url = new URL(window.location.href)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          url.searchParams.set(key, value.join(','))
        } else {
          url.searchParams.set(key, String(value))
        }
      } else {
        url.searchParams.delete(key)
      }
    })
    
    router.push(url.pathname + url.search, { scroll: false })
  }, [router])

  // Load models on component mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true)
        const models = await loadModelData()
        setVideoModels(models)
      } catch (error) {
        console.error('Failed to load models:', error)
        setVideoModels([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadModels()
  }, [])

  // Helper function to get actual model creator/developer
  const getModelCreator = (model: any) => {
    // Extract creator from model ID or display name
    const modelId = model.model_id || ''
    const displayName = model.display_name || model.name || ''
    
    // Map known model creators
    if (modelId.includes('veo') || displayName.toLowerCase().includes('veo')) {
      return 'Google'
    }
    if (modelId.includes('kling') || displayName.toLowerCase().includes('kling')) {
      return 'Kuaishou'
    }
    if (modelId.includes('wan') || displayName.toLowerCase().includes('wan')) {
      return 'Alibaba WAN'
    }
    if (modelId.includes('ltx') || displayName.toLowerCase().includes('ltx')) {
      return 'Lightricks'
    }
    if (modelId.includes('minimax') || displayName.toLowerCase().includes('minimax') || displayName.toLowerCase().includes('hailuo')) {
      return 'MiniMax'
    }
    if (modelId.includes('pixverse') || displayName.toLowerCase().includes('pixverse')) {
      return 'Pixverse'
    }
    if (modelId.includes('seedance') || displayName.toLowerCase().includes('seedance')) {
      return 'Seedance'
    }
    if (modelId.includes('vidu') || displayName.toLowerCase().includes('vidu')) {
      return 'Vidu'
    }
    
    // Default fallback
    return 'Unknown'
  }

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    updateURL({ search: value, type: selectedType, category: selectedCategory, creator: selectedCreator, provider: selectedProvider, tags: selectedTags, page: 1 })
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
    updateURL({ search: searchQuery, type, category: selectedCategory, creator: selectedCreator, provider: selectedProvider, tags: selectedTags, page: 1 })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    updateURL({ search: searchQuery, type: selectedType, category, creator: selectedCreator, provider: selectedProvider, tags: selectedTags, page: 1 })
  }

  const handleCreatorChange = (creator: string) => {
    setSelectedCreator(creator)
    setCurrentPage(1)
    updateURL({ search: searchQuery, type: selectedType, category: selectedCategory, creator, provider: selectedProvider, tags: selectedTags, page: 1 })
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setCurrentPage(1)
    updateURL({ search: searchQuery, type: selectedType, category: selectedCategory, creator: selectedCreator, provider, tags: selectedTags, page: 1 })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(newTags)
    setCurrentPage(1)
    updateURL({ search: searchQuery, type: selectedType, category: selectedCategory, creator: selectedCreator, provider: selectedProvider, tags: newTags, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateURL({ search: searchQuery, type: selectedType, category: selectedCategory, creator: selectedCreator, provider: selectedProvider, tags: selectedTags, page })
  }

  // Convert model ID to URL-safe key (must match the mapping in layout.tsx)
  const getModelUrlKey = (modelId: string): string => {
    const idToKeyMap: Record<string, string> = {
      'fal-ai/veo/3/fast': 'veo-3-fast',
      'fal-ai/ltx-video/13b-098': 'ltx-video-13b',
      'fal-ai/vidu/q1': 'vidu-q1',
      'fal-ai/pixverse/v4.5/text-to-video': 'pixverse-v45',
      'fal-ai/kling-video/v1.6/pro/text-to-video': 'kling-video-pro',
      'fal-ai/minimax/hailuo-02/pro/text-to-video': 'minimax-hailuo-02-pro',
      'fal-ai/bytedance/seedance-v1/pro': 'seedance-v1-pro',
      'fal-ai/wan/turbo/text-to-video': 'wan-turbo-text',
      'fal-ai/wan/turbo/image-to-video': 'wan-turbo-image',
      'fal-ai/wan/v2.2-5b/text-to-video': 'wan-v22-5b',
    }
    
    return idToKeyMap[modelId] || modelId.replace(/\//g, '-').replace(/\./g, '-')
  }

  const handleModelSelect = (model: any) => {
    // Navigate to model-specific video generation page
    const urlKey = getModelUrlKey(model.id)
    router.push(`/models/${urlKey}`)
  }

  // Filter models based on all criteria
  const filteredModels = videoModels.filter((model: any) => {
    const matchesSearch = searchQuery === '' || 
                         model.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === 'all' || model.type === selectedType
    
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
    
    const matchesCreator = selectedCreator === '' || 
                          getModelCreator(model).toLowerCase().includes(selectedCreator.toLowerCase())
    
    const matchesProvider = selectedProvider === '' || 
                           (model.provider && model.provider.toLowerCase().includes(selectedProvider.toLowerCase()))
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => 
                         model.tags && Array.isArray(model.tags) && 
                         model.tags.some((modelTag: string) => 
                           modelTag.toLowerCase().includes(tag.toLowerCase())
                         )
                       )
    
    return matchesSearch && matchesType && matchesCategory && matchesCreator && matchesProvider && matchesTags
  })

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedModels = filteredModels.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Get unique values for filters
  const categories = ['all', ...Array.from(new Set(videoModels.map(m => m.category).filter(Boolean)))]
  const allCreators = Array.from(new Set(videoModels.map(m => getModelCreator(m)).filter(Boolean)))
  const allProviders = Array.from(new Set(videoModels.map(m => m.provider).filter(Boolean)))
  const allTags = Array.from(new Set(
    videoModels.flatMap(m => m.tags || []).filter(Boolean)
  ))

  const hasActiveFilters = searchQuery !== '' || selectedType !== 'all' || selectedCategory !== 'all' || selectedCreator !== '' || selectedProvider !== '' || selectedTags.length > 0

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedCategory('all')
    setSelectedCreator('')
    setSelectedProvider('')
    setSelectedTags([])
    setCurrentPage(1)
    updateURL({})
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-1">
          <PageHeaderSkeleton />
          <FiltersSkeleton />
          <ModelsGridSkeleton />
          <PaginationSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Dashboard Subheader */}
      <DashboardSubheader
        title="Browse AI Models"
        description="Explore available video generation models and click to start creating"
      />
      
      <div className="space-y-6 p-6">
        {/* Search and Filter Bar */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative  ">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearchChange('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[140px]">
                  <HugeiconsIcon icon={VideoReplayIcon} className="w-4 h-4" />
                  {selectedType === 'all' ? 'All Types' : selectedType.replace('-', ' to ')}
                  <HugeiconsIcon icon={ArrowDown01Icon} className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleTypeChange('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeChange('text-to-video')}>
                  Text to Video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTypeChange('image-to-video')}>
                  Image to Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Creator Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 min-w-[140px]">
                  <HugeiconsIcon icon={UserIcon} className="w-4 h-4" />
                  {selectedCreator === '' ? 'All Creators' : selectedCreator}
                  <HugeiconsIcon icon={ArrowDown01Icon} className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleCreatorChange('')}>
                  All Creators
                </DropdownMenuItem>
                {allCreators.map((creator) => (
                  <DropdownMenuItem key={creator} onClick={() => handleCreatorChange(creator)}>
                    {creator}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearAllFilters} className="flex items-center gap-2">
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>



        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Search: "{searchQuery}"
                <button onClick={() => handleSearchChange('')} className="ml-1 hover:text-destructive">
                  <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Type: {selectedType.replace('-', ' to ')}
                <button onClick={() => handleTypeChange('all')} className="ml-1 hover:text-destructive">
                  <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {selectedCreator && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Creator: {selectedCreator}
                <button onClick={() => handleCreatorChange('')} className="ml-1 hover:text-destructive">
                  <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredModels.length)} of {filteredModels.length} models
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedModels.map((model: any) => {
            return (
              <Card 
                key={model.id} 
                className="hover:border-primary/40 transition-shadow overflow-hidden cursor-pointer group p-0"
                onClick={() => handleModelSelect(model)}
              >
                <CardContent className="p-0">
                  {/* Model Icon Header */}
                  <div className="aspect-video  bg-foreground/10 relative flex items-center justify-center">
                    <img src="/logo.svg" alt="DengeAI Logo" className="w-16 h-16 opacity-60" />
                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                      <StatusBadge 
                        variant={model.type === 'text-to-video' ? 'blue' : 'purple'}
                      >
                        {model.type === 'text-to-video' ? 'Text to Video' : 'Image to Video'}
                      </StatusBadge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{model.display_name || model.name}</h3>
                        <p className="text-sm text-muted-foreground">{getModelCreator(model)}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {model.description}
                    </p>
                    
                    {/* Model Features */}
                    {model.parameters && (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium">Key Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(model.parameters)
                            .slice(0, 3)
                            .map(([key, param]: [string, any]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {param.description?.split(' ').slice(0, 2).join(' ') || key}
                              </Badge>
                            ))
                          }
                        </div>
                      </div>
                    )}
                    
                    {/* Prompt Tips */}
                    {model.prompt_guidance && (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium">Prompt Tips:</h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {model.prompt_guidance.slice(0, 2).map((tip: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                        <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2" />
                        Click to generate prompts with this model
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <HugeiconsIcon icon={ArrowRight02Icon} className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredModels.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon icon={BrainIcon} className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No models found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button onClick={clearAllFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function ModelsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <ModelsPageContent />
    </Suspense>
  )
}