'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Cancel01Icon,
  Copy01Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/ui/button"
import { StatusBadge } from "@workspace/ui/components/ui/status-badge"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"

interface VideoPrompt {
  id: string
  title: string
  description: string
  prompt: string
  category: 'cinematic' | 'animation' | 'documentary' | 'commercial' | 'artistic' | 'experimental'
  style?: string
  modelName: string
  creator: string
  source: string
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3'
  status: 'active' | 'draft' | 'archived' | 'featured'
  thumbnail?: string
  previewVideo?: string
  createdAt: string
  updatedAt?: string
  tags?: string[]
  isPublic?: boolean
  isFavorite?: boolean
}

interface VideoPromptDrawerProps {
  prompt: VideoPrompt | null
  isOpen: boolean
  onClose: () => void
  onCopy?: (prompt: VideoPrompt) => void
  onGoToPage?: (promptId: string) => void
}

export function VideoPromptDrawer({ 
  prompt, 
  isOpen, 
  onClose, 
  onCopy, 
  onGoToPage 
}: VideoPromptDrawerProps) {
  const { toast } = useToast()
  
  if (!prompt) return null

  const getCategoryColor = (category: string) => {
    const colors = {
      cinematic: 'purple',
      animation: 'orange',
      documentary: 'blue',
      commercial: 'green',
      artistic: 'cyan',
      experimental: 'red'
    }
    return colors[category as keyof typeof colors] || 'default'
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt)
      toast({
        title: "Copied to clipboard!",
        description: "The prompt text has been copied to your clipboard.",
        variant: "success"
      })
      onCopy?.(prompt)
    } catch (err) {
      console.error('Failed to copy prompt:', err)
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={onClose} />
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Video Prompt Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Video Preview */}
            {prompt.previewVideo ? (
              <div className="relative aspect-video overflow-hidden bg-muted">
                <video
                  src={prompt.previewVideo}
                  className="w-full h-full object-cover"
                  controls
                  poster={prompt.thumbnail}
                />
              </div>
            ) : prompt.thumbnail && (
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={prompt.thumbnail}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Title and Meta */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold leading-tight">{prompt.prompt}</h3>
                  {prompt.status !== 'active' && (
                    <StatusBadge 
                      variant={
                        prompt.status === 'featured' ? 'beta' : 
                        prompt.status === 'draft' ? 'yellow' : 
                        'default'
                      }
                    >
                      {prompt.status === 'featured' && 'Featured'}
                      {prompt.status === 'draft' && 'Draft'}
                      {prompt.status === 'archived' && 'Archived'}
                    </StatusBadge>
                  )}
                </div>
                
                {prompt.description && (
                  <p className="text-muted-foreground leading-relaxed">{prompt.description}</p>
                )}
                
                {/* Category and Creator */}
                <div className="flex items-center justify-between">
                  <StatusBadge variant={getCategoryColor(prompt.category) as any}>
                    {prompt.category.charAt(0).toUpperCase() + prompt.category.slice(1)}
                  </StatusBadge>
                  <span className="text-sm text-muted-foreground">by {prompt.creator}</span>
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Prompt</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="h-8 px-3 text-xs"
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-muted/50 border border-border/50 text-sm leading-relaxed">
                  {prompt.prompt}
                </div>
              </div>

              {/* Model & Tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{prompt.modelName}</span>
                </div>
                
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {prompt.tags.slice(0, 4).map((tag, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 bg-muted/50 text-xs text-muted-foreground border border-border/50"
                      >
                        {tag}
                      </div>
                    ))}
                    {prompt.tags.length > 4 && (
                      <div className="px-2 py-1 bg-muted/50 text-xs text-muted-foreground border border-border/50">
                        +{prompt.tags.length - 4} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/50">
            <Button
              onClick={handleCopyPrompt}
              className="w-full"
              size="lg"
            >
              <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4 mr-2" />
              Copy Prompt
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
