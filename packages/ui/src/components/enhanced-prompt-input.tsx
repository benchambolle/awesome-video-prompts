"use client"

import { forwardRef } from "react"
import { Textarea } from "@workspace/ui/components/ui/textarea"
import { Label } from "@workspace/ui/components/ui/label"
import { Button } from "@workspace/ui/components/ui/button"
import { PromptEnhancer } from "@workspace/ui/components/prompt-enhancer"
import { ImagePromptGenerator } from "@workspace/ui/components/image-prompt-generator"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon, Image01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

interface EnhancedPromptInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  textareaClassName?: string
  showTextEnhancer?: boolean
  showImageGenerator?: boolean
  textEnhancerButtonText?: string
  imageGeneratorButtonText?: string
  buttonVariant?: "default" | "outline" | "ghost"
  minHeight?: string
  helperText?: string
  buttonsPosition?: "top" | "bottom"
}

export const EnhancedPromptInput = forwardRef<
  HTMLTextAreaElement,
  EnhancedPromptInputProps
>(({
  label = "Prompt",
  placeholder = "Enter your prompt...",
  value,
  onChange,
  disabled = false,
  className,
  textareaClassName,
  showTextEnhancer = true,
  showImageGenerator = true,
  textEnhancerButtonText = "Enhance",
  imageGeneratorButtonText = "From Image",
  buttonVariant = "outline",
  minHeight = "120px",
  helperText,
  buttonsPosition = "top"
}, ref) => {
  const handlePromptEnhanced = (enhancedPrompt: string) => {
    onChange(enhancedPrompt)
  }

  const handlePromptGenerated = (generatedPrompt: string) => {
    onChange(generatedPrompt)
  }

  const ActionButtons = () => (
    <div className="flex items-center gap-2">
      {showTextEnhancer && (
        <PromptEnhancer
          initialPrompt={value}
          onPromptEnhanced={handlePromptEnhanced}
        >
          <Button 
            variant={buttonVariant}
            size="sm" 
            className="gap-2"
            disabled={disabled}
          >
            <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
            {textEnhancerButtonText}
          </Button>
        </PromptEnhancer>
      )}
      
      {showImageGenerator && (
        <ImagePromptGenerator
          onPromptGenerated={handlePromptGenerated}
        >
          <Button 
            variant={buttonVariant}
            size="sm" 
            className="gap-2"
            disabled={disabled}
          >
            <HugeiconsIcon icon={Image01Icon} className="h-4 w-4" />
            {imageGeneratorButtonText}
          </Button>
        </ImagePromptGenerator>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and Action Buttons (Top) */}
      {buttonsPosition === "top" && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {label}
          </Label>
          <ActionButtons />
        </div>
      )}

      {/* Label Only (if buttons at bottom) */}
      {buttonsPosition === "bottom" && (
        <Label className="text-sm font-medium">
          {label}
        </Label>
      )}

      {/* Textarea */}
      <Textarea
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn("resize-none", textareaClassName)}
        style={{ minHeight }}
      />

      {/* Action Buttons (Bottom) */}
      {buttonsPosition === "bottom" && (
        <div className="flex justify-end">
          <ActionButtons />
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
})

EnhancedPromptInput.displayName = "EnhancedPromptInput"
