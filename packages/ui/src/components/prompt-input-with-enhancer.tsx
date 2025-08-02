"use client"

import { forwardRef } from "react"
import { Textarea } from "@workspace/ui/components/ui/textarea"
import { Label } from "@workspace/ui/components/ui/label"
import { Button } from "@workspace/ui/components/ui/button"
import { PromptEnhancer } from "@workspace/ui/components/prompt-enhancer"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

interface PromptInputWithEnhancerProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  textareaClassName?: string
  showEnhancer?: boolean
  enhancerButtonText?: string
  enhancerButtonVariant?: "default" | "outline" | "ghost"
  minHeight?: string
  helperText?: string
}

export const PromptInputWithEnhancer = forwardRef<
  HTMLTextAreaElement,
  PromptInputWithEnhancerProps
>(({
  label = "Prompt",
  placeholder = "Enter your prompt...",
  value,
  onChange,
  disabled = false,
  className,
  textareaClassName,
  showEnhancer = true,
  enhancerButtonText = "Enhance",
  enhancerButtonVariant = "outline",
  minHeight = "120px",
  helperText
}, ref) => {
  const handlePromptEnhanced = (enhancedPrompt: string) => {
    onChange(enhancedPrompt)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and Enhance Button */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {label}
        </Label>
        {showEnhancer && (
          <PromptEnhancer
            initialPrompt={value}
            onPromptEnhanced={handlePromptEnhanced}
          >
            <Button 
              variant={enhancerButtonVariant}
              size="sm" 
              className="gap-2"
              disabled={disabled}
            >
              <HugeiconsIcon icon={SparklesIcon} className="h-4 w-4" />
              {enhancerButtonText}
            </Button>
          </PromptEnhancer>
        )}
      </div>

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

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  )
})

PromptInputWithEnhancer.displayName = "PromptInputWithEnhancer"
