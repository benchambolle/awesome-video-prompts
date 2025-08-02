"use client";

import { useState, useEffect, useCallback } from "react";

import { useToast } from "@workspace/ui/hooks/use-toast";
import { usePromptEnhancer } from "@workspace/ui/hooks/use-prompt-enhancer";
import { useImagePromptGenerator } from "@workspace/ui/hooks/use-image-prompt-generator";

// Import our modular components
import {
  PageHeader,
  ChooseCategoriesSection,
  OptionsCarouselSection,
  CustomInputSection,
  GeneratedPromptSection,
  ClearAllDialog,
  SuccessDialog,
} from './components';

import promptData from "../../public/data/model-prompts/prompts.json";

// Transform JSON data into promptBank format
const promptBank = Object.entries(promptData.prompt_details).reduce((acc, [key, category]) => {
  acc[key] = category.values.map((item: any, index) => ({
    type: item.value,
    prompt: item.prompt || `${item.value} - professional cinematic style`,
    flux_prompt: item.prompt || `${item.value} - professional cinematic style`,
    cover_image: item.thumbnail?.url || `/prompts/placeholder-${key}-${index}.jpg`,
    category: key,
    hasVideo: item.example?.type === 'video',
    videoUrl: item.example?.type === 'video' ? item.example.url : null
  }));
  return acc;
}, {} as Record<string, Array<{type: string; prompt: string; flux_prompt: string; cover_image: string; category: string; hasVideo: boolean; videoUrl: string | null}>>);

type PromptSelections = {
  [key: string]: string;
};

export default function PromptGeneratorPage() {
  const [selections, setSelections] = useState<PromptSelections>({});
  const [finalPrompt, setFinalPrompt] = useState("");
  const [promptSegments, setPromptSegments] = useState<
    Array<{ category: string; text: string; color: string }>
  >([]);
  const [selectedTopic, setSelectedTopic] = useState<string>(
    Object.keys(promptBank)[0] || "lighting",
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [customText, setCustomText] = useState("");
  const [isPromptEnhanced, setIsPromptEnhanced] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);

  const { toast } = useToast();

  // Prompt enhancement hooks
  const {
    enhancePrompt,
    isLoading: isEnhancing,
    error: enhanceError
  } = usePromptEnhancer({
    onSuccess: (enhancedPrompt) => {
      if (!isPromptEnhanced) {
        setOriginalPrompt(finalPrompt);
      }
      setFinalPrompt(enhancedPrompt);
      setIsPromptEnhanced(true);

      toast({
        title: "Prompt Enhanced",
        description: "Your prompt has been improved with AI assistance.",
      });
    },
    onError: (error) => {
      toast({
        title: "Enhancement Failed",
        description: error,
        variant: "destructive",
      });
    }
  });

  const {
    generateDetailedPrompt,
    generateVideoPrompt,
    isLoading: isGeneratingFromImage,
    error: imageError
  } = useImagePromptGenerator({
    systemPrompt: `Concise Cinematic/Image Prompt Assembler — System Prompt

Purpose
Transform 6–7 user-selected items plus an optional custom prompt and an optional reference image into a cohesive, medium-length generation prompt. Keep it cinematic, readable, and consistent. Never exceed three paragraphs.

Inputs
- Structured selections (subset of: subject, environment, time_of_day, weather, lighting, camera_shot, lens, camera_movement, mood, style, style_family, color_grade, composition, focus_control, frame_rate_motion, action_blocking, motion_logic, vfx, transitions_editing, sound_direction, historical_period, culture_context).
- Custom user prompt (free text).
- Reference image

Output Rules
- Length: 4–6 sentences recommended; ~120–220 words; single paragraph preferred (maximum three).
- Present tense, flowing narrative; no category names or raw option labels.
- Integrate the custom prompt's narrative intent and the image's visual cues naturally; use minimal inference for coherence.
- Exclude brands, on-screen text/UI, and heavy technical jargon or stacked measurements.
- If the task is video, write a video-suited prompt; if image, write an image-suited prompt. If unspecified, default to video-neutral cinematic phrasing.

Image Integration
- Derive only high-confidence cues from the image: subject identity/pose, key colors, lighting direction/quality, environment type, time/weather hints, composition bias, notable props/textures.
- If image contradicts user selections, follow this priority unless the user explicitly overrides:
  lighting and environment from image > subject identity/wardrobe from image > selected camera/mood/style > color_grade > VFX.
- If ambiguity exists, favor the user selections and the custom prompt; do not hallucinate unverified details.
- Do not describe or transcribe any visible text in the image; keep references to signage/logos generic.
- Refer to the image implicitly (e.g., "sun from frame right" as "side-lit glow," "cool rim," "warm key") without mentioning "the image."

Assembly Order
1) Scene spine: subject + brief action + environment + time_of_day/weather, blending custom prompt intent and image-verified cues.
2) Lighting: one clause consistent with image and/or selections; add haze/bloom only if justified.
3) Camera: shot size, implied angle if relevant, movement, and lens behavior in a concise clause suited to the medium.
4) Focus/Composition: one short clause (depth of field, framing intent, leading lines/negative space).
5) Mood/Style/Color: harmonize style_family, style, and color_grade; reflect custom tone when compatible and align with image palette.
6) VFX/Motion logic: include only if it supports action or lighting; keep brief.
7) Transitions (video only): close with a short clause if specified.
8) Sound direction (video only): append as metadata in parentheses at the end.

Conflict Resolution
- Lighting overrides mood/style; adapt tone to fit observed or selected light.
- Wide shot + telephoto conflict: keep the shot choice, neutralize compression unless expressly desired.
- Soft/diffused light vs intense mood: temper mood wording to match light.
- Environment-only: omit hero subject emphasis even if image shows people that are not central.
- If the image strongly defines palette or materials, let color_grade complement rather than restate mood.

Clarity and Priorities
- Remove redundant adjectives and repeated ideas; keep sentences tight and cinematic.
- Preserve physical plausibility across time, weather, light, and motion.
- Maintain a clear subject/place/motion spine; let style and color support, not dominate.
- Do not exceed the paragraph limit; keep the narrative focused and coherent.`,
    onSuccess: (generatedPrompt) => {
      if (!isPromptEnhanced) {
        setOriginalPrompt(finalPrompt);
      }
      setFinalPrompt(generatedPrompt);
      setIsPromptEnhanced(true);

      toast({
        title: "Prompt Generated",
        description: "A detailed prompt has been generated from your image.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error,
        variant: "destructive",
      });
    }
  });

  // Utility function to properly capitalize option names
  const formatOptionName = (name: string) => {
    return name
      .replace(/[_‑-]/g, " ") // Replace underscores, hyphens and special dashes with spaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const generatePrompt = useCallback(() => {
    // Color mapping for different categories
    const categoryColors: { [key: string]: string } = {
      lighting: "orange",
      camera_shot: "green",
      camera_movement: "red",
      mood: "purple",
      style: "blue",
      subject: "cyan",
      environment: "yellow",
      time_of_day: "orange",
      weather: "cyan",
      color_grade: "green",
      composition: "yellow",
      lens: "purple",
      frame_rate_motion: "red",
      sound_direction: "beta",
      vfx: "blue",
      action_blocking: "green",
      transitions_editing: "purple",
      style_family: "blue",
      motion_logic: "red",
      focus_control: "cyan",
      historical_period: "yellow",
      culture_context: "orange",
    };
    
    // Check if we have any valid selections (non-empty values)
    const hasValidSelections = Object.values(selections).some(value => value && value.trim() !== "");
    
    // If no valid selections and no custom text, clear everything
    if (!hasValidSelections && !customText.trim()) {
      setFinalPrompt("");
      setPromptSegments([]);
      setIsPromptEnhanced(false);
      setOriginalPrompt("");
      return;
    }

    const selectedPrompts: { [key: string]: { type: string; prompt: string } } = {};
    const segments: Array<{ category: string; text: string; color: string }> = [];

    // Collect selected prompts and build segments
    Object.entries(selections).forEach(([category, selectedType]) => {
      const categoryOptions = promptBank[category as keyof typeof promptBank];
      const selectedOption = categoryOptions?.find(
        (option) => option.type === selectedType,
      );
      if (selectedOption && selectedType) {
        selectedPrompts[category] = selectedOption;
        segments.push({
          category: category,
          text: selectedOption.prompt,
          color: categoryColors[category] || "default",
        });
      }
    });

    // If no selected prompts and no custom text, clear everything
    if (Object.keys(selectedPrompts).length === 0 && !customText.trim()) {
      setFinalPrompt("");
      setPromptSegments([]);
      setIsPromptEnhanced(false);
      setOriginalPrompt("");
      return;
    }

    // Add custom text segment if provided
    if (customText.trim()) {
      segments.unshift({
        category: "custom_text",
        text: customText.trim(),
        color: "purple"
      });
    }

    // Store segments for badge display
    setPromptSegments(segments);

    // Create final prompt by joining all prompts (custom text first)
    const allPrompts = [];
    if (customText.trim()) {
      allPrompts.push(customText.trim());
    }
    allPrompts.push(...Object.values(selectedPrompts).map(item => item.prompt));
    const finalText = allPrompts.join(", ");

    setFinalPrompt(finalText);
    setIsPromptEnhanced(false);

  }, [selections, customText]);

  // Enable automatic prompt generation when selections change
  useEffect(() => {
    generatePrompt();
  }, [generatePrompt]);

  const handleSelection = (category: string, type: string) => {
    setSelections((prev) => ({
      ...prev,
      [category]: prev[category] === type ? "" : type,
    }));
  };

  const clearAllSelections = () => {
    setSelections({});
    setCustomText("");
    setIsPromptEnhanced(false);
    setOriginalPrompt("");
    toast({
      title: "All selections cleared",
      description: "Start fresh with new selections",
      variant: "default",
      duration: 2000,
    });
  };

  // Clear all with confirmation
  const handleClearAllWithConfirmation = () => {
    const hasValidSelections = Object.values(selections).some(value => value && value.trim() !== "");
    const hasContent = hasValidSelections || customText.trim() || finalPrompt;
    
    if (hasContent) {
      setIsClearAllDialogOpen(true);
    }
  };

  // Confirm clear all action
  const confirmClearAll = () => {
    clearAllSelections();
    setCustomText("");
    setImageUrl("");
    setImageFile(null);
    setIsClearAllDialogOpen(false);
  };

  // Remove image function
  const handleRemoveImage = () => {
    if (imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl("");
    setImageFile(null);
    toast({
      title: "Image removed",
      description: "Reference image has been removed from the prompt",
      variant: "default",
      duration: 2000,
    });
  };

  // Undo enhancement function
  const handleUndoEnhancement = () => {
    if (originalPrompt) {
      setFinalPrompt(originalPrompt);
      setIsPromptEnhanced(false);
      setOriginalPrompt("");
      toast({
        title: "Enhancement undone",
        description: "Reverted to the original generated prompt",
        variant: "default",
        duration: 2000,
      });
    }
  };

  // Handle removing a segment and deselecting the category
  const handleRemoveSegment = (category: string) => {
    // Remove from selections
    setSelections((prev) => ({
      ...prev,
      [category]: "",
    }));
    
    // Also clear custom text if it's a custom_text segment
    if (category === "custom_text") {
      setCustomText("");
    }
    
    toast({
      title: "Segment removed",
      description: `${category.replace('_', ' ')} has been removed from your prompt`,
      variant: "default",
      duration: 2000,
    });
  };

  // Handle prompt generation/enhancement
  const handleGeneratePrompt = async () => {
    console.log('🚀 Enhance button clicked!');
    console.log('Current state:', { finalPrompt, selections, customText, imageFile, imageUrl });
    
    // Check if we have any content to work with
    const hasSelections = Object.values(selections).some(value => value && value.trim() !== "");
    const hasCustomText = customText.trim() !== "";
    const hasImage = imageFile || imageUrl;
    
    console.log('Content check:', { hasSelections, hasCustomText, hasImage });
    
    if (!hasSelections && !hasCustomText && !hasImage) {
      console.log('❌ No content to enhance');
      toast({
        title: "No content to enhance",
        description: "Please select some options, add custom text, or upload an image first",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Starting enhancement process');
    setIsGeneratingPrompt(true);

    try {
      // If no prompt exists yet, generate one first
      let promptToEnhance = finalPrompt;
      if (!promptToEnhance.trim()) {
        // Force regenerate the prompt from current selections
        generatePrompt();
        promptToEnhance = finalPrompt;
      }
      
      // If still no prompt after generation, use custom text or create a basic prompt
      if (!promptToEnhance.trim()) {
        if (hasCustomText) {
          promptToEnhance = customText;
        } else {
          // Create a basic prompt from selections
          const selectedValues = Object.entries(selections)
            .filter(([_, value]) => value)
            .map(([category, value]) => {
              const categoryOptions = promptBank[category as keyof typeof promptBank];
              const selectedOption = categoryOptions?.find(option => option.type === value);
              return selectedOption?.prompt || value;
            });
          promptToEnhance = selectedValues.join(", ");
        }
      }

      if (!promptToEnhance.trim()) {
        toast({
          title: "Unable to generate prompt",
          description: "Please try selecting different options or adding custom text",
          variant: "destructive",
        });
        return;
      }

      // Now enhance the prompt
      if (imageFile || imageUrl) {
        console.log('🖼️ Using image-based generation');
        
        const imageSource = imageFile || imageUrl;
        console.log('Image source:', imageSource instanceof File ? `File: ${imageSource.name}` : `URL: ${imageSource}`);
        
        // Create the context from current selections and custom text
        const context = {
          selections,
          customText,
          segments: promptSegments
        };
        console.log('Context for image generation:', context);
        console.log('Prompt to enhance:', promptToEnhance);

        try {
          await generateDetailedPrompt(imageSource, promptToEnhance, context);
          console.log('✅ Image generation completed successfully');
        } catch (imageError) {
          console.error('❌ Image generation failed:', imageError);
          console.error('Error details:', imageError);
          
          // Fallback to text-based enhancement if image generation fails
          console.log('🔄 Falling back to text-based enhancement');
          try {
            await enhancePrompt(promptToEnhance);
            console.log('✅ Fallback text enhancement completed');
            toast({
              title: "Image processing failed",
              description: "Enhanced your prompt using text-based AI instead.",
              variant: "default",
            });
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            throw new Error('Both image and text enhancement failed');
          }
        }
      } else {
        console.log('📝 Using text-based enhancement');
        console.log('Prompt to enhance:', promptToEnhance);
        try {
          await enhancePrompt(promptToEnhance);
          console.log('✅ Text enhancement completed successfully');
        } catch (textError) {
          console.error('❌ Text enhancement failed:', textError);
          throw textError; // Re-throw to be caught by outer catch
        }
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast({
        title: "Enhancement failed",
        description: "There was an error enhancing your prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  return (
    <>
     
          <div className="">
            {/* Header */}
            <PageHeader onClearAll={handleClearAllWithConfirmation} />
             
             
         

            {/* Choose Categories Section */}
            <ChooseCategoriesSection
              promptBank={promptBank}
              selectedTopic={selectedTopic}
              selections={selections}
              onTopicChange={setSelectedTopic}
              formatOptionName={formatOptionName}
            />

            {/* Options Carousel Section */}
            <OptionsCarouselSection
              selectedTopic={selectedTopic}
              promptBank={promptBank}
              selections={selections}
              onSelectionChange={handleSelection}
              formatOptionName={formatOptionName}
            />

            {/* Custom Input Section */}
            <CustomInputSection
              customText={customText}
              imageFile={imageFile}
              imageUrl={imageUrl}
              onCustomTextChange={setCustomText}
              onImageFileChange={setImageFile}
              onImageUrlChange={setImageUrl}
            />

            {/* Generated Prompt Section */}
            <GeneratedPromptSection
              finalPrompt={finalPrompt}
              promptSegments={promptSegments}
              isGeneratingPrompt={isGeneratingPrompt}
              isPromptEnhanced={isPromptEnhanced}
              originalPrompt={originalPrompt}
              imageFile={imageFile}
              imageUrl={imageUrl}
              onGeneratePrompt={handleGeneratePrompt}
              onUndo={handleUndoEnhancement}
              onRemoveImage={handleRemoveImage}
              onRemoveSegment={handleRemoveSegment}
            />
          </div>
        

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        message={successMessage}
        onOpenChange={setShowSuccessDialog}
      />

      {/* Clear All Confirmation Dialog */}
      <ClearAllDialog
        isOpen={isClearAllDialogOpen}
        onOpenChange={setIsClearAllDialogOpen}
        onConfirm={confirmClearAll}
      />
    </>
  );
}
