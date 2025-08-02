'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Cancel01Icon, 
  Copy01Icon, 
  PlayIcon,
  ArrowRight01Icon,
  VideoReplayIcon,
  UserIcon,
   
  CheckmarkCircle01Icon,
  AspectRatioIcon,
  CatalogueIcon
} from "@hugeicons/core-free-icons"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/ui/sheet"
import { Button } from "@workspace/ui/components/ui/button"
import { Badge } from "@workspace/ui/components/ui/badge"
import { StatusBadge } from "@workspace/ui/components/ui/status-badge"
import { toast } from "sonner"
import type { VideoPrompt } from "@workspace/ui/types/prompt"

interface PromptDetailsDrawerProps {
  prompt: VideoPrompt | null
  isOpen: boolean
  onClose: () => void
  onNavigate?: (url: string) => void
}

export function PromptDetailsDrawer({ 
  prompt, 
  isOpen, 
  onClose,
  onNavigate 
}: PromptDetailsDrawerProps) {
  if (!prompt) return null

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt.prompt)
    toast.success("Prompt copied to clipboard!")
  }

  const handleGoToPage = () => {
    onNavigate?.(`/prompts/${prompt.id}`)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="text-left p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <SheetTitle className="text-xl font-bold text-foreground leading-tight">
                {prompt.title}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {prompt.description}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 shrink-0"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-8">
          {/* Video Preview */}
          {(prompt.previewVideo || prompt.thumbnail) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Preview</h3>
              <div className="relative aspect-video bg-muted rounded-xl overflow-hidden shadow-sm border border-border">
                {prompt.previewVideo ? (
                  <video
                    src={prompt.previewVideo}
                    className="w-full h-full object-cover"
                    controls
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={prompt.thumbnail}
                    alt={prompt.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

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

          {/* Metadata */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={CatalogueIcon} className="w-5 h-5 text-primary" />
              Details
            </h3>
            
            <div className="space-y-4">
              {/* Category and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CatalogueIcon} className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium text-sm">Category</span>
                  </div>
                  <StatusBadge variant="blue" className="capitalize">
                    {prompt.category}
                  </StatusBadge>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium text-sm">Status</span>
                  </div>
                  <StatusBadge 
                    variant={prompt.status === 'featured' ? 'green' : 'default'}
                    className="capitalize"
                  >
                    {prompt.status}
                  </StatusBadge>
                </div>
              </div>
              
              {/* Model and Creator Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={VideoReplayIcon} className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium text-sm">Model</span>
                  </div>
                  <p className="text-foreground font-semibold text-sm leading-relaxed">
                    {prompt.modelName}
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium text-sm">Creator</span>
                  </div>
                  <p className="text-foreground font-semibold text-sm leading-relaxed">
                    {prompt.creator}
                  </p>
                </div>
              </div>
              
              {/* Additional Details Row */}
              {(prompt.aspectRatio || prompt.generationType) && (
                <div className="grid grid-cols-2 gap-4">
                  {prompt.aspectRatio && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={AspectRatioIcon} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium text-sm">Aspect Ratio</span>
                      </div>
                      <p className="text-foreground font-semibold text-sm">
                        {prompt.aspectRatio}
                      </p>
                    </div>
                  )}
                  
                  {prompt.generationType && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={PlayIcon} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium text-sm">Type</span>
                      </div>
                      <StatusBadge variant="purple" className="capitalize">
                        {prompt.generationType.replace('_', ' ')}
                      </StatusBadge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
 
          {/* Actions */}
          <div className="pt-6 mt-6 border-t border-border">
            <div className="bg-muted/20 rounded-lg p-1 flex gap-1">
              <Button
                onClick={handleCopyPrompt}
                className="flex-1 h-11 bg-transparent hover:bg-background border-0 shadow-none"
                variant="ghost"
              >
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                Copy Prompt
              </Button>
              
              <Button
                onClick={handleGoToPage}
                className="flex-1 h-11 bg-transparent hover:bg-background border-0 shadow-none"
                variant="ghost"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 mr-2" />
                Go to Page
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
