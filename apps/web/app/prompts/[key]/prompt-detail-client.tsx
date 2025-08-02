"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  VideoReplayIcon, 
  ArrowLeft01Icon, 
  Copy01Icon,
  PlayIcon,
  ImageIcon,
  CatalogueIcon,
  UserIcon,
  CalendarIcon,
  SettingsIcon,
  TagIcon,
  StarIcon,
  AspectRatioIcon,
  VideoIcon
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/ui/card"
import { Button } from "@workspace/ui/components/ui/button"
import { Badge } from "@workspace/ui/components/ui/badge"
import { StatusBadge } from "@workspace/ui/components/ui/status-badge"
import { DashboardSubheader } from "@workspace/ui/components/dashboard-subheader"
import { clientDataApi } from "../../../lib/client-data-loader"
import { getSourceDisplayName } from "../../../types/source"

export default function PromptDetailClient() {
  const params = useParams()
  const router = useRouter()
  const key = params.key as string
  
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        setLoading(true)
        const foundPrompt = await clientDataApi.getPromptById(key)
        setPrompt(foundPrompt)
      } catch (error) {
        console.error('Error loading prompt:', error)
      } finally {
        setLoading(false)
      }
    }

    if (key) {
      loadPrompt()
    }
  }, [key])

  const handleCopyPrompt = async () => {
    if (prompt?.prompt) {
      await navigator.clipboard.writeText(prompt.prompt)
    }
  }

  const handleUsePrompt = () => {
    if (prompt?.prompt && prompt?.modelName) {
      // Convert model name to URL key format
      const getModelKey = (modelName: string): string => {
        const modelMappings: Record<string, string> = {
          'fal-ai/wan/v2.2-5b/text-to-video': 'wan-v22-5b',
          'fal-ai/wan/turbo/text-to-video': 'wan-turbo-text',
          'fal-ai/wan/turbo/image-to-video': 'wan-turbo-image',
          'fal-ai/ltx-video/13b-098': 'ltx-video-13b',
          'fal-ai/veo/3/fast': 'veo-3-fast',
          'fal-ai/vidu/q1': 'vidu-q1',
          'fal-ai/pixverse/v4.5/text-to-video': 'pixverse-v45',
          'fal-ai/kling-video/v1.6/pro/text-to-video': 'kling-video-pro',
          'fal-ai/minimax/hailuo-02/pro/text-to-video': 'minimax-hailuo-02-pro',
          'fal-ai/minimax/hailuo-02/standard/text-to-video': 'minimax-hailuo-02-standard-text',
          'fal-ai/minimax/hailuo-02/standard/image-to-video': 'minimax-hailuo-02-standard-image',
          'fal-ai/minimax/hailuo-02/pro/image-to-video': 'minimax-hailuo-02-pro-image',
          'fal-ai/bytedance/seedance-v1/pro': 'seedance-v1-pro'
        }
        
        return modelMappings[modelName] || modelName.replace(/\//g, '-').replace(/\./g, '-')
      }
      
      const modelKey = getModelKey(prompt.modelName)
      const encodedPrompt = encodeURIComponent(prompt.prompt)
      router.push(`/models/${modelKey}?prompt=${encodedPrompt}`)
    }
  }

  const handleGoBack = () => {
    router.push('/prompts')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Prompt Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested prompt could not be found.</p>
          <Button onClick={handleGoBack} variant="outline">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back to Prompts
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardSubheader
        title={prompt.title}
        description="Detailed view of the video generation prompt"
        icon={VideoReplayIcon}
        iconBoxVariant="purple"
      >
        <div className="flex items-center gap-2">
          <Button onClick={handleGoBack} variant="outline" size="sm">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
          <Button onClick={handleCopyPrompt} variant="outline" size="sm">
            <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
            Copy Prompt
          </Button>
        </div>
      </DashboardSubheader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          {prompt.video && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={PlayIcon} className="h-5 w-5" />
                  Example Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video
                    src={prompt.video}
                    controls
                    className="w-full h-full object-cover"
                    poster={prompt.thumbnailUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={VideoIcon} className="h-5 w-5" />
                Prompt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{prompt.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Full Prompt</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">{prompt.prompt}</code>
                </div>
              </div>

              {prompt.tags && prompt.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <HugeiconsIcon icon={TagIcon} className="h-4 w-4" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={SettingsIcon} className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={CatalogueIcon} className="h-4 w-4" />
                  Category
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs font-medium border border-border bg-background/95 hover:bg-background"
                  onClick={() => router.push(`/prompts?category=${prompt.category}`)}
                >
                  {prompt.category}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                  Creator
                </span>
                <span className="text-sm font-medium">{prompt.source?.name || 'Unknown'}</span>
              </div>

              {prompt.modelName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={VideoIcon} className="h-4 w-4" />
                    Model
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs font-medium border border-border bg-background/95 hover:bg-background"
                    onClick={() => {
                      const getModelKey = (modelName: string): string => {
                        const modelMappings: Record<string, string> = {
                          'fal-ai/wan/v2.2-5b/text-to-video': 'wan-v22-5b',
                          'fal-ai/wan/turbo/text-to-video': 'wan-turbo-text',
                          'fal-ai/wan/turbo/image-to-video': 'wan-turbo-image',
                          'fal-ai/ltx-video/13b-098': 'ltx-video-13b',
                          'fal-ai/veo/3/fast': 'veo-3-fast',
                          'fal-ai/vidu/q1': 'vidu-q1',
                          'fal-ai/pixverse/v4.5/text-to-video': 'pixverse-v45',
                          'fal-ai/kling-video/v1.6/pro/text-to-video': 'kling-video-pro',
                          'fal-ai/minimax/hailuo-02/pro/text-to-video': 'minimax-hailuo-02-pro',
                          'fal-ai/minimax/hailuo-02/standard/text-to-video': 'minimax-hailuo-02-standard-text',
                          'fal-ai/minimax/hailuo-02/standard/image-to-video': 'minimax-hailuo-02-standard-image',
                          'fal-ai/minimax/hailuo-02/pro/image-to-video': 'minimax-hailuo-02-pro-image',
                          'fal-ai/bytedance/seedance-v1/pro': 'seedance-v1-pro'
                        }
                        return modelMappings[modelName] || modelName.replace(/\//g, '-').replace(/\./g, '-')
                      }
                      const modelKey = getModelKey(prompt.modelName)
                      router.push(`/models/${modelKey}`)
                    }}
                  >
                    {prompt.modelName}
                  </Button>
                </div>
              )}

              {prompt.source && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={ImageIcon} className="h-4 w-4" />
                    Source
                  </span>
                  <span className="text-sm font-medium">{getSourceDisplayName(prompt.source)}</span>
                </div>
              )}

              {prompt.status && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />
                    Status
                  </span>
                  <StatusBadge variant={prompt.featured ? 'green' : 'default'} className="capitalize">
                    {prompt.featured ? 'Featured' : prompt.status}
                  </StatusBadge>
                </div>
              )}

              {prompt.generationType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={VideoIcon} className="h-4 w-4" />
                    Type
                  </span>
                  <StatusBadge variant="blue" className="capitalize">
                    {prompt.generationType === 'text_to_video' ? 'Text to Video' : 
                     prompt.generationType === 'image_to_video' ? 'Image to Video' : 
                     prompt.generationType.replace('_', ' ')}
                  </StatusBadge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default" onClick={handleUsePrompt}>
                <HugeiconsIcon icon={PlayIcon} className="mr-2 h-4 w-4" />
                Use This Prompt
              </Button>
              
              <Button onClick={handleCopyPrompt} className="w-full" variant="outline">
                <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                Copy Prompt Text
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
