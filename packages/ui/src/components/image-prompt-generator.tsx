"use client"

import { useState, useRef } from "react"
import { Button } from "@workspace/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/ui/dialog"
import { Textarea } from "@workspace/ui/components/ui/textarea"
import { Input } from "@workspace/ui/components/ui/input"
import { Label } from "@workspace/ui/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Image01Icon, 
  Copy01Icon, 
  ArrowRight01Icon, 
  Upload01Icon,
  VideoReplayIcon,
  PaintBrushIcon,
  Camera01Icon
} from "@hugeicons/core-free-icons"
import { Alert, AlertDescription } from "@workspace/ui/components/ui/alert"
import { Badge } from "@workspace/ui/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/ui/tabs"
import { useImagePromptGenerator } from "@workspace/ui/hooks/use-image-prompt-generator"

interface ImagePromptGeneratorProps {
  children?: React.ReactNode
  onPromptGenerated?: (generatedPrompt: string) => void
}

export function ImagePromptGenerator({ children, onPromptGenerated }: ImagePromptGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [activeTab, setActiveTab] = useState("detailed")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    generateDetailedPrompt,
    generateVideoPrompt,
    generateStylePrompt,
    isLoading,
    error,
    progress,
    clearError
  } = useImagePromptGenerator({
    onSuccess: (prompt) => {
      setGeneratedPrompt(prompt)
    },
    onError: (err) => {
      console.error("Image prompt generation failed:", err)
    }
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      // Create a local URL for preview
      const localUrl = URL.createObjectURL(file)
      setImageUrl(localUrl)
      clearError()
    }
  }

  const handleGenerate = async () => {
    if (!imageUrl.trim()) {
      return
    }

    let finalImageUrl = imageUrl

    // If it's a local file, we need to upload it first
    if (imageFile && imageUrl.startsWith('blob:')) {
      // For demo purposes, we'll use a placeholder
      // In production, you'd upload to your storage service
      console.log("Would upload file:", imageFile.name)
      // For now, we'll use the provided example URL
      finalImageUrl = "https://fal.media/files/tiger/4Ew1xYW6oZCs6STQVC7V8_86440216d0fe42e4b826d03a2121468e.jpg"
    }

    switch (activeTab) {
      case "detailed":
        await generateDetailedPrompt(finalImageUrl)
        break
      case "video":
        await generateVideoPrompt(finalImageUrl)
        break
      case "style":
        await generateStylePrompt(finalImageUrl)
        break
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const useGeneratedPrompt = () => {
    if (generatedPrompt && onPromptGenerated) {
      onPromptGenerated(generatedPrompt)
    }
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Clean up object URL if it exists
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
      setImageUrl("")
      setImageFile(null)
      setGeneratedPrompt("")
      clearError()
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "detailed": return Image01Icon
      case "video": return VideoReplayIcon
      case "style": return PaintBrushIcon
      default: return Image01Icon
    }
  }

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "detailed": return "Generate detailed image description"
      case "video": return "Generate video sequence prompt"
      case "style": return "Analyze artistic style and technique"
      default: return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <HugeiconsIcon icon={Image01Icon} className="h-4 w-4" />
            Generate from Image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Image01Icon} className="h-5 w-5" />
            AI Image Prompt Generator
          </DialogTitle>
          <DialogDescription>
            Upload an image or provide a URL to generate detailed prompts using AI vision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Image Source</Label>
            
            {/* File Upload */}
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                disabled={isLoading}
              >
                <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4" />
                Upload Image
              </Button>
              <span className="text-sm text-muted-foreground self-center">or</span>
            </div>

            {/* URL Input */}
            <Input
              placeholder="Enter image URL..."
              value={imageFile ? "" : imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setImageFile(null)
                clearError()
              }}
              disabled={isLoading || !!imageFile}
            />

            {imageFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {imageFile.name}
              </div>
            )}
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="border rounded-lg overflow-hidden max-h-[200px] flex items-center justify-center bg-muted">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-[200px] max-w-full object-contain"
                  onError={() => {
                    console.error("Failed to load image")
                  }}
                />
              </div>
            </div>
          )}

          {/* Generation Type Tabs */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Generation Type</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detailed" className="gap-2">
                  <HugeiconsIcon icon={Image01Icon} className="h-4 w-4" />
                  Detailed
                </TabsTrigger>
                <TabsTrigger value="video" className="gap-2">
                  <HugeiconsIcon icon={VideoReplayIcon} className="h-4 w-4" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="style" className="gap-2">
                  <HugeiconsIcon icon={PaintBrushIcon} className="h-4 w-4" />
                  Style
                </TabsTrigger>
              </TabsList>
              
              <div className="text-xs text-muted-foreground text-center py-2">
                {getTabDescription(activeTab)}
              </div>
            </Tabs>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerate}
              disabled={isLoading || !imageUrl.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Camera01Icon} className="h-4 w-4" />
                  Generate Prompt
                </>
              )}
            </Button>
          </div>

          {/* Processing Progress */}
          {progress.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Processing</Label>
              <div className="bg-muted rounded-md p-3 max-h-[100px] overflow-y-auto">
                {progress.slice(-5).map((log, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Prompt */}
          {generatedPrompt && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Generated Prompt</Label>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {activeTab}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedPrompt)}
                    className="h-8 px-2 gap-1"
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[120px] resize-none bg-muted/50"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {generatedPrompt && onPromptGenerated && (
            <Button onClick={useGeneratedPrompt} className="gap-2">
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
              Use Generated Prompt
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
